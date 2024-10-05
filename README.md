# Altas Pelis 

**Check it out here: [Altas Pelis](https://altaspelis.com/)**

Altas Pelis is a content-based movie recommender system that uses Sentence Transformers to generate embeddings for each movie based on its details.
It computes the cosine similarity matrix on-the-fly for each movie, and it does so very fast!


## How It Works

1. **Movie Database**: I built a dataset of over 10,000 movies by combining information from IMDb (movie details, directors, ratings, cast) and TMDB (overviews, posters, backdrops, keywords, production countries).

2. **Similarity Calculation**: I used Sentence Transformers to generate embeddings for each movie based on their details. Then, I calculated the cosine similarity between the embeddings with a custom implementation (because sklearn didn't fit in PythonAnywhere's free tier). The similarity matrix is computed on-the-fly, and it's very fast. Embeddings are stored in a numpy array.

3. **Stack**:
   - Frontend: Built with Next.js
   - Backend: Flask server providing endpoints for movie search, recommendations, and movie details
   - Data: All movie data and similarity information is stored in NumPy arrays

4. **Performance**: The use of sparse matrices and NumPy arrays allows for fast, memory-efficient operation, even with a large dataset.

Altas Pelis is a simple tool designed to make movie discovery easier, faster and more enjoyable across different streaming services.
