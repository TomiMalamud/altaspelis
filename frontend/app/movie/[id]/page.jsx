import MovieDetails from '@/components/movie-details';

export const revalidate = 86400;

async function getAllMovieIds() {
  const response = await fetch('https://tmalamud.pythonanywhere.com/api/movies', { cache: 'force-cache' });
  if (!response.ok) {
    console.error("Failed to fetch movie list for static generation:", response.status);
    return [];
  }
  const data = await response.json();
  return (data.movies || []).map(movie => ({
    id: movie.id, 
  }));
}

export async function generateStaticParams() {
  const movies = await getAllMovieIds();
  return movies.map(movie => ({
    id: movie.id.toString(),
  }));
}

async function getMovieDetails(id) {
  const response = await fetch(`https://tmalamud.pythonanywhere.com/api/movie/${id}`, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Error fetching movie details: ${response.status}`);
  }
  return response.json();
}

async function getSimilarMovies(id) {
  const response = await fetch(`https://tmalamud.pythonanywhere.com/api/recommend?tconst=${id}`, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Error fetching similar movies: ${response.status}`);
  }
  const data = await response.json();
  return data.recommendations || [];
}

export default async function Page({ params }) {
  const { id } = await params;

  const [movie, similarMovies] = await Promise.all([
    getMovieDetails(id),
    getSimilarMovies(id),
  ]).catch(error => {
    console.error(`Error fetching page data for ID ${id}:`, error);
    return [null, []];
  });

  if (!movie) {
    return <div className="text-center py-10">Movie not found or error fetching details.</div>;
  }

  return <MovieDetails movie={movie} similarMovies={similarMovies} />;
}