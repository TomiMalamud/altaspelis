# Altas Pelis

Altas Pelis is a movie recommendation website that finds movies similar to your favorite ones.

It is built with Next.js and the TMDB API, and it uses the IMDb dataset for ranking.
The backend is built with Flask, and is hosted on PythonAnywhere.

It's completely free and doesn't track you or use cookies.

Check it out at [altaspelis.com](https://www.altaspelis.com)!
---

### 1. Data (`load_dataset.py`)

- Merges data from IMDb datasets (basics, crew, ratings and actors) with TMDb data, including overviews, taglines, poster paths, keywords, and watch providers.

### 2. Similarity Computation (`similarity.py`)

- Uses scikit-learn's `CountVectorizer` to create a bag-of-words representation of movie features.
- Computes cosine similarity between movies based on their feature vectors.
- Optimizes memory usage by converting the dense similarity matrix to a sparse matrix (CSR format) and saving it to disk.

### 3. Flask Backend API (`back.py`)

- Provides endpoints for movie search, recommendations, and individual movie details.
- Implements memory-efficient loading of the pre-computed sparse similarity matrix.

## Highlights

- **Feature Engineering**: Combines textual features (overview, tagline, keywords) with categorical data (genres, directors, actors) to create a rich representation of each movie.
- **Similarity Metric**: Uses cosine similarity as the core metric for finding similar movies, which works well for high-dimensional, sparse data typical in text-based features.

## Future Improvements

- Implement matrix factorization techniques (e.g., SVD) for collaborative filtering.
- Explore more advanced NLP techniques for processing textual features (e.g., word embeddings, transformer models).
- Improve search using fuzzywuzzy for title matching and plot description.
