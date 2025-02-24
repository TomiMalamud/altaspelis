import json
import math
import os
from ast import literal_eval
from functools import wraps

import numpy as np
import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv(dotenv_path=".env")

app = Flask(__name__)
# Restrict CORS to specific domains
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://www.altaspelis.com",
                "https://altaspelis.com",
                "https://altaspelis.vercel.app",
            ]
        }
    },
)

# Add rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Add request size limit
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024  # 1 MB max-limit

df = None
embeddings = None
indices = None


# Utility functions
def cosine_similarity(A, B):
    A = A.reshape(1, -1) if A.ndim == 1 else A
    B = B.reshape(1, -1) if B.ndim == 1 else B
    dot_product = np.dot(A, B.T)
    norm_A = np.linalg.norm(A, axis=1).reshape(-1, 1)
    norm_B = np.linalg.norm(B, axis=1).reshape(1, -1)
    return dot_product / (norm_A * norm_B)


def parse_string_to_json(s):
    if not isinstance(s, str) or s.strip() == "":
        return s
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        try:
            return literal_eval(s)
        except (ValueError, SyntaxError):
            return s


def json_serializable(obj):
    if isinstance(obj, (int, str, bool, type(None))):
        return obj
    elif isinstance(obj, float):
        return obj if not math.isnan(obj) else None
    elif isinstance(obj, (list, tuple)):
        return [json_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: json_serializable(value) for key, value in obj.items()}
    else:
        return str(obj)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        return (
            None
            if isinstance(obj, float) and math.isnan(obj)
            else json_serializable(obj)
        )


app.json_encoder = CustomJSONEncoder


# Data loading and preprocessing
def load_data():
    global df, embeddings, indices
    # Get the directory where flask_app.py is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Construct the full path to dataset.csv
    df = pd.read_csv(os.path.join(base_dir, "dataset.csv")).fillna("")
    embeddings = np.load(os.path.join(base_dir, "embeddings.npy"))
    indices = {row["tconst"]: idx for idx, row in df.iterrows()}
    df["popularity_score"] = (df["numVotes"] - df["numVotes"].min()) / (
        df["numVotes"].max() - df["numVotes"].min()
    )


load_data()


# Recommendation logic
def get_recommendations(tconst, top_n=30, content_weight=0.8, popularity_weight=0.2):
    if tconst not in indices:
        return None
    idx = indices[tconst]
    movie_embedding = embeddings[idx].reshape(1, -1)
    cosine_sim = cosine_similarity(movie_embedding, embeddings)[0]

    def compute_combined_sim(content_sim, popularity_score):
        return content_weight * content_sim + popularity_weight * popularity_score

    sim_scores = [
        (i, compute_combined_sim(content_sim, df["popularity_score"].iloc[i]))
        for i, content_sim in enumerate(cosine_sim)
    ]

    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1 : top_n + 1]
    movie_indices = [i[0] for i in sim_scores]

    recommendations = df.loc[movie_indices].copy()
    recommendations["similarity"] = [i[1] for i in sim_scores]
    return recommendations.sort_values(by="similarity", ascending=False)


def handle_movies():
    # Validate and sanitize input
    search_query = (
        request.args.get("search", "").lower().strip()[:100]
    )  # Limit to 100 chars
    if not search_query.isascii():  # Only allow ASCII characters
        return jsonify({"error": "Invalid search query"}), 400

    max_movies = min(int(request.args.get("limit", 30)), 50)  # Cap at 50 movies

    try:

        def filter_movies(df):
            if not search_query:
                return df.sort_values(by="numVotes", ascending=False)
            return df[
                df["title"].str.lower().str.contains(search_query, regex=False)
                | df["originalTitle"]
                .str.lower()
                .str.contains(search_query, regex=False)
                | df["director_names"]
                .str.lower()
                .str.contains(search_query, regex=False)
                | df["actor_names"].str.lower().str.contains(search_query, regex=False)
            ].sort_values(by="numVotes", ascending=False)

        filtered_df = filter_movies(df)
        movies = filtered_df.head(max_movies).to_dict("records")
        parsed_movies = [
            {k: parse_string_to_json(v) for k, v in movie.items()} for movie in movies
        ]
        return jsonify({"movies": json_serializable(parsed_movies)})
    except Exception as e:
        print(f"Error in handle_movies: {e}")
        return jsonify({"error": "An error occurred processing your request"}), 500


def handle_recommendations():
    tconst = request.args.get("tconst", "")
    if not tconst:
        return jsonify({"error": "Invalid tconst"}), 400

    recommendations = get_recommendations(tconst)
    if recommendations is None:
        return jsonify({"error": "Movie not found"}), 404

    movies = recommendations.to_dict("records")
    serialized_movies = [
        {
            k: (
                int(v)
                if isinstance(v, np.int64)
                else float(v) if isinstance(v, np.float64) else v
            )
            for k, v in movie.items()
        }
        for movie in movies
    ]

    return jsonify({"recommendations": serialized_movies})


def handle_movie_details(tconst):
    requested_lang = request.args.get(
        "lang", "en"
    )  # Default to English if no language specified
    lang_mapping = {"es_AR": "es-AR", "en": "en-US"}
    tmdb_lang = lang_mapping.get(requested_lang, "en-US")

    movie = df[df["tconst"] == tconst]
    if movie.empty:
        return jsonify({"error": "Movie not found"}), 404

    movie_dict = movie.iloc[0].to_dict()

    if tmdb_lang != "en-US":
        tmdb_api_key = os.getenv("TMDB_API_KEY")
        if not tmdb_api_key:
            return jsonify({"error": "TMDB API key not configured"}), 500

        tmdb_id = movie_dict.get("id")
        if not tmdb_id:
            return jsonify({"error": "TMDB ID not found for this movie"}), 404

        tmdb_url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?language={tmdb_lang}&api_key={tmdb_api_key}"

        try:
            tmdb_response = requests.get(tmdb_url)
            if tmdb_response.status_code != 200:
                return (
                    jsonify({"error": "Failed to fetch movie details from TMDB"}),
                    tmdb_response.status_code,
                )

            tmdb_data = tmdb_response.json()

            movie_dict.update(
                {
                    "genres": " ".join(
                        genre["name"] for genre in tmdb_data.get("genres", [])
                    ),
                    "overview": tmdb_data.get("overview", ""),
                    "title": tmdb_data.get("title", ""),
                }
            )
        except Exception as e:
            print(f"Error fetching data from TMDB: {e}")
            return (
                jsonify({"error": "An error occurred while fetching movie details"}),
                500,
            )

    parsed_movie = {
        k: parse_string_to_json(v) if isinstance(v, str) else v
        for k, v in movie_dict.items()
    }
    return jsonify(json_serializable(parsed_movie))


# Route decorators
def route_handler(route, methods=["GET"]):
    def decorator(f):
        @app.route(route, methods=methods)
        @wraps(f)
        def wrapped(*args, **kwargs):
            return f(*args, **kwargs)

        return wrapped

    return decorator


# Routes with rate limits
@app.route("/api/movies", methods=["GET"])
@limiter.limit("30/minute")
def movies_endpoint():
    return handle_movies()


@app.route("/api/recommend", methods=["GET"])
@limiter.limit("30/minute")
def recommend_endpoint():
    return handle_recommendations()


@app.route("/api/movie/<string:tconst>", methods=["GET"])
@limiter.limit("60/minute")
def movie_details_endpoint(tconst):
    return handle_movie_details(tconst)


# Error handlers
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": "Rate limit exceeded"}), 429


@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"error": "Request entity too large"}), 413