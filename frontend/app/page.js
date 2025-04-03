import MovieListClient from '@/components/movie-list-client';

async function getMovies() {
  const response = await fetch('https://tmalamud.pythonanywhere.com/api/movies', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Error fetching movies: ${response.status}`);
  }
  const data = await response.json();
  return data.movies;
}

export default async function Page() {
  const initialMovies = await getMovies();
  return <MovieListClient initialMovies={initialMovies} />;
}