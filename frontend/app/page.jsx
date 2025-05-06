import MovieList from '@/components/movie-list';

async function getMovies() {
  const url = new URL('https://tmalamud.pythonanywhere.com/api/movies');
  const response = await fetch(url.toString(), { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Error fetching movies: ${response.status}`);
  }
  const data = await response.json();
  return data.movies || [];
}

export default async function Page() {
  const movies = await getMovies();
  return <MovieList movies={movies} />;
}