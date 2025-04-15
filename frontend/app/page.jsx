import MovieList from '@/components/movie-list';

async function getMovies(searchQuery = '') {
  const url = new URL('https://tmalamud.pythonanywhere.com/api/movies');
  if (searchQuery) {
    url.searchParams.append('search', searchQuery);
  }
  const response = await fetch(url.toString(), { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Error fetching movies: ${response.status}`);
  }
  const data = await response.json();
  return data.movies || [];
}

export default async function Page({ searchParams }) {
  const searchQuery = searchParams?.search || '';
  const movies = await getMovies(searchQuery);
  return <MovieList movies={movies} searchQuery={searchQuery} />;
}