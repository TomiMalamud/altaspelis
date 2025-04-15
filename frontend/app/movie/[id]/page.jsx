import MovieDetails from '@/components/movie-details';

async function getMovieDetails(id, lang) {
  const response = await fetch(`https://tmalamud.pythonanywhere.com/api/movie/${id}?lang=${lang}`, { cache: 'force-cache' });
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

async function getWatchProviders(id) {
  const tmdbIdResponse = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${process.env.TMDB_API_KEY}&external_source=imdb_id`, { cache: 'force-cache' });
  if (!tmdbIdResponse.ok) {
    console.error(`Error fetching TMDB ID for tconst ${id}: ${tmdbIdResponse.status}`);
    return null;
  }
  const tmdbIdData = await tmdbIdResponse.json();
  const tmdbMovieId = tmdbIdData.movie_results?.[0]?.id;

  if (!tmdbMovieId) {
    console.error(`TMDB ID not found for tconst ${id}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbMovieId}/watch/providers?api_key=${process.env.TMDB_API_KEY}`,
      {
        cache: 'force-cache',
      }
    );
    if (!response.ok) {
      console.error(`Error fetching watch providers for TMDB ID ${tmdbMovieId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.results?.AR ?? null;
  } catch (error) {
    console.error('Error fetching watch providers:', error);
    return null;
  }
}

export default async function Page({ params, searchParams }) {
  const lang = searchParams.lang || 'en';
  
  const [movie, similarMovies, watchProviders] = await Promise.all([
    getMovieDetails(params.id, lang),
    getSimilarMovies(params.id),
    getWatchProviders(params.id)
  ]).catch(error => {
    console.error("Error fetching page data:", error);
    return [null, [], null];
  });

  if (!movie) {
    return <div className="text-center py-10">Movie not found</div>;
  }

  return <MovieDetails movie={movie} similarMovies={similarMovies} watchProviders={watchProviders} />;
}