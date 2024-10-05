from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from ast import literal_eval
import json
import math
import os
import requests
from functools import partial, wraps
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://127.0.0.1:3000", "https://www.altaspelis.com", "https://altaspelis.com", "https://altaspelis.vercel.app"]}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

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
    if not isinstance(s, str) or s.strip() == '':
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
        return None if isinstance(obj, float) and math.isnan(obj) else json_serializable(obj)

app.json_encoder = CustomJSONEncoder

# Data loading and preprocessing
def load_data():
    global df, embeddings, indices
    df = pd.read_csv('dataset.csv').fillna('')
    embeddings = np.load('embeddings.npy')
    indices = {row['tconst']: idx for idx, row in df.iterrows()}
    df['popularity_score'] = (df['numVotes'] - df['numVotes'].min()) / (df['numVotes'].max() - df['numVotes'].min())

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
    
    sim_scores = [(i, compute_combined_sim(content_sim, df['popularity_score'].iloc[i])) 
                  for i, content_sim in enumerate(cosine_sim)]
    
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]
    movie_indices = [i[0] for i in sim_scores]
    
    recommendations = df.loc[movie_indices].copy()
    recommendations['similarity'] = [i[1] for i in sim_scores]
    return recommendations.sort_values(by='similarity', ascending=False)

# Geolocation
def get_user_country():
    try:
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip in ['127.0.0.1', '::1']:
            return 'AR'
        response = requests.get(f'https://ipinfo.io/{ip}/json')
        if response.status_code != 200:
            print(f"ipinfo.io responded with status code {response.status_code}")
            return ''
        return response.json().get('country', '')
    except Exception as e:
        print(f"Error determining user country: {e}")
        return ''

# Route handlers
def handle_default_language():
    country = get_user_country()
    return jsonify({'default_language': 'es_AR' if country.upper() == 'AR' else 'en'})

def handle_movies():
    search_query = request.args.get('search', '').lower()[:100]  # Limit to 100 characters
    max_movies = 30
    
    def filter_movies(df):
        if not search_query:
            return df.sort_values(by='numVotes', ascending=False)
        return df[
            df['title'].str.lower().str.contains(search_query) |
            df['originalTitle'].str.lower().str.contains(search_query) |
            df['director_names'].str.lower().str.contains(search_query) |
            df['actor_names'].str.lower().str.contains(search_query)
        ].sort_values(by='numVotes', ascending=False)
    
    filtered_df = filter_movies(df)
    movies = filtered_df.head(max_movies).to_dict('records')
    
    parsed_movies = [{k: parse_string_to_json(v) for k, v in movie.items()} for movie in movies]
    return jsonify({'movies': json_serializable(parsed_movies)})

def handle_recommendations():
    tconst = request.args.get('tconst', '')
    if not tconst:
        return jsonify({'error': 'Invalid tconst'}), 400
    
    recommendations = get_recommendations(tconst)
    if recommendations is None:
        return jsonify({'error': 'Movie not found'}), 404
    
    movies = recommendations.to_dict('records')
    serialized_movies = [{k: int(v) if isinstance(v, np.int64) else float(v) if isinstance(v, np.float64) else v 
                          for k, v in movie.items()} for movie in movies]
    
    return jsonify({'recommendations': serialized_movies})

def handle_movie_details(tconst):
    requested_lang = request.args.get('lang', None)
    lang = requested_lang if requested_lang else ('es_AR' if get_user_country().upper() == 'AR' else 'en')
    lang_mapping = {'es_AR': 'es-AR', 'en': 'en-US'}
    tmdb_lang = lang_mapping.get(lang, 'en-US')
    
    movie = df[df['tconst'] == tconst]
    if movie.empty:
        return jsonify({'error': 'Movie not found'}), 404
    
    movie_dict = movie.iloc[0].to_dict()
    
    if tmdb_lang != 'en-US':
        tmdb_api_key = os.getenv('TMDB_API_KEY')
        if not tmdb_api_key:
            return jsonify({'error': 'TMDB API key not configured'}), 500
        
        tmdb_id = movie_dict.get('id')
        if not tmdb_id:
            return jsonify({'error': 'TMDB ID not found for this movie'}), 404
        
        tmdb_url = f'https://api.themoviedb.org/3/movie/{tmdb_id}?language={tmdb_lang}&api_key={tmdb_api_key}'
        
        try:
            tmdb_response = requests.get(tmdb_url)
            if tmdb_response.status_code != 200:
                return jsonify({'error': 'Failed to fetch movie details from TMDB'}), tmdb_response.status_code
            
            tmdb_data = tmdb_response.json()
            
            movie_dict.update({
                'genres': ' '.join(genre['name'] for genre in tmdb_data.get('genres', [])),
                'overview': tmdb_data.get('overview', ''),
                'title': tmdb_data.get('title', '')
            })
        except Exception as e:
            print(f"Error fetching data from TMDB: {e}")
            return jsonify({'error': 'An error occurred while fetching movie details'}), 500
    
    parsed_movie = {k: parse_string_to_json(v) if isinstance(v, str) else v for k, v in movie_dict.items()}
    return jsonify(json_serializable(parsed_movie))

# Route decorators
def route_handler(route, methods=['GET']):
    def decorator(f):
        @app.route(route, methods=methods)
        @wraps(f)
        def wrapped(*args, **kwargs):
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Routes
route_handler('/api/default_language')(handle_default_language)
route_handler('/api/movies')(handle_movies)
route_handler('/api/recommend')(handle_recommendations)
route_handler('/api/movie/<string:tconst>')(handle_movie_details)

if __name__ == '__main__':
    app.run()
