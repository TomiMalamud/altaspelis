import MovieDetailsClient from '@/components/movie-details-client';

async function getMovieDetails(id, lang) {
  const response = await fetch(`https://tmalamud.pythonanywhere.com/api/movie/${id}?lang=${lang}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Error fetching movie details: ${response.status}`);
  }
  return response.json();
}

async function getSimilarMovies(id) {
  const response = await fetch(`https://tmalamud.pythonanywhere.com/api/recommend?tconst=${id}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Error fetching similar movies: ${response.status}`);
  }
  const data = await response.json();
  return data.recommendations || [];
}

export default async function Page({ params }) {
  const [movie, similarMovies] = await Promise.all([
    getMovieDetails(params.id, 'en'),
    getSimilarMovies(params.id)
  ]);

  if (!movie) {
    return <div className="text-center py-10">Movie not found</div>;
  }

  return <MovieDetailsClient movie={movie} similarMovies={similarMovies} />;
}