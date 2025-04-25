import MovieDetails from '@/components/movie-details';

export const revalidate = 86400; // Revalidate once per day

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
  
  const [movie, similarMovies] = await Promise.all([
    getMovieDetails(params.id),
    getSimilarMovies(params.id),
  ]).catch(error => {
    console.error("Error fetching page data:", error);
    return [null, []];
  });

  if (!movie) {
    return <div className="text-center py-10">Movie not found</div>;
  }

  return <MovieDetails movie={movie} similarMovies={similarMovies} />;
}