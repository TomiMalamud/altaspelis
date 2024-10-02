'use client';

import Image from 'next/image';
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MovieImage from '@/components/movie-image';
import { LanguageContext } from '@/context/language-context';

export default function MovieDetails() {
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const { id } = useParams();
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);
  const [errorMovie, setErrorMovie] = useState(null);
  const [errorSimilar, setErrorSimilar] = useState(null);
  const { lang, t } = useContext(LanguageContext);

  // Fetch Movie Details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      setIsLoadingMovie(true);
      try {
        const movieResponse = await fetch(`https://tmalamud.pythonanywhere.com/api/movie/${id}?lang=${lang}`);
        if (!movieResponse.ok) {
          throw new Error(`HTTP error! status: ${movieResponse.status}`);
        }
        const movieData = await movieResponse.json();
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setErrorMovie(`Error fetching movie details: ${error.message}`);
      }
      setIsLoadingMovie(false);
    };

    fetchMovieDetails();
  }, [id, lang]);

  // Fetch Similar Movies
  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!id) return;
      setIsLoadingSimilar(true);
      try {
        const similarMoviesResponse = await fetch(`https://tmalamud.pythonanywhere.com/api/recommend?tconst=${id}`);
        if (!similarMoviesResponse.ok) {
          throw new Error(`HTTP error! status: ${similarMoviesResponse.status}`);
        }
        const similarMoviesData = await similarMoviesResponse.json();
        setSimilarMovies(similarMoviesData.recommendations || []);
      } catch (error) {
        console.error('Error fetching similar movies:', error);
        setErrorSimilar(`Error fetching similar movies: ${error.message}`);
      }
      setIsLoadingSimilar(false);
    };

    fetchSimilarMovies();
  }, [id]);

  useEffect(() => {
    const fetchWatchProviders = async () => {
      if (!id) return;
      setIsLoadingProviders(true);
      try {
        const watchProvidersResponse = await fetch(`/api/movie-providers?id=${id}`);
        if (!watchProvidersResponse.ok) {
          throw new Error(`HTTP error! status: ${watchProvidersResponse.status}`);
        }
        const watchProvidersData = await watchProvidersResponse.json();
        setWatchProviders(watchProvidersData.results?.AR);
      } catch (error) {
        console.error('Error fetching watch providers:', error);
      }
      setIsLoadingProviders(false);
    };

    fetchWatchProviders();
  }, [id]);

  if (isLoadingMovie) return <></>;
  if (errorMovie) return <div className="text-center text-red-500 py-10">{errorMovie}</div>;
  if (!movie) return <div className="text-center py-10">{t.noMoviesFound}</div>;

  return (
    <div className="container mx-auto min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row mb-8">
        {/* Backdrop Image for Mobile */}
        <div className="w-full md:w-3/12 md:hidden mb-4">
          {movie.backdrop_path && (
            <Image
              unoptimized
              src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
              alt={`${movie.title} backdrop`}
              width={1280}
              height={720}
              className="w-full rounded-lg object-cover h-48"
            />
          )}
        </div>

        {/* Poster Image for Desktop */}
        <div className="w-5/12 mx-auto md:w-3/12 hidden md:block">
          {movie.poster_path && (
            <Image
              unoptimized
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              width={500}
              height={750}
              className="w-full rounded-lg"
            />
          )}
        </div>

        {/* Movie Details */}
        <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <p className="mb-4 text-gray-100">{movie.overview}</p>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-x-2 mb-6">
            {movie.genres && movie.genres.split(' ').map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {genre}
              </Badge>
            ))}
          </div>

          {/* Release Date and Runtime */}
          <p className="text-gray-300 mb-6">
            {movie.release_date ? `${movie.release_date.split('-')[0]}` : ''} | {movie.runtimeMinutes ? `${Math.floor(movie.runtimeMinutes / 60)} h ${movie.runtimeMinutes % 60} min` : ''}
          </p>

          {/* Director and Actors */}
          <div className="mb-6">
            {movie.director_names && (
              <p className="text-gray-300">
                <span className="text-gray-500">{t.director || 'Director'}:</span> {movie.director_names}
              </p>
            )}
            {movie.actor_names && (
              <p className="text-gray-300">
                <span className="text-gray-500">{t.stars}:</span> {movie.actor_names}
              </p>
            )}
          </div>

          {/* IMDb Rating and Watch Providers */}
          <div className="flex flex-col sm:flex-row w-full gap-6">
            {/* IMDb Rating */}
            <div className="w-full sm:w-auto">
              <a href={`https://www.imdb.com/title/${movie.tconst}/ratings`} target="_blank" rel="noopener noreferrer">
                <p className="text-sm font-semibold mb-2 tracking-widest text-gray-400">{t.imdbRating || 'IMDb Rating'}</p>
                <Card className="px-6 py-4 bg-gradient-to-br from-yellow-100/10 to-black transition-all hover:to-yellow-100/10" style={{ borderColor: '#f5c518' }}>
                  <div className="flex items-center">
                    <Star className="h-10 w-10" style={{ color: '#f5c518' }} />
                    <div className="ml-4">
                      <p className="text-xl font-bold">
                        {movie.averageRating} <span className="text-gray-400 text-sm font-normal">/10</span>
                      </p>
                      <p className="text-sm font-light text-gray-400">
                        {movie.numVotes >= 1000000
                          ? `${(movie.numVotes / 1000000).toFixed(1)}M`
                          : movie.numVotes >= 1000
                            ? `${(movie.numVotes / 1000).toFixed(1)}K`
                            : movie.numVotes}{' '}
                        {t.votes || 'votes'}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            </div>

            {/* Watch Providers */}
            <div className="w-full sm:w-auto">
              <h3 className="text-sm font-semibold mb-2 tracking-widest text-gray-400">{t.whereToWatch}</h3>
              {isLoadingProviders ? (
                <></>
              ) : watchProviders && watchProviders.flatrate ? (
                <Card className='p-4'>
                  <div>
                    <a href={watchProviders.link} target="_blank" rel="noopener noreferrer">
                      <div className="flex flex-wrap justify-center gap-x-6">
                        {watchProviders.flatrate.map((provider) => (
                          <div key={provider.provider_id} className="flex items-center">
                            <Image
                              unoptimized
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              width={50}
                              height={50}
                              className="rounded-full"
                            />
                          </div>
                        ))}
                      </div>
                    </a>
                  </div>
                </Card>
              ) : (
                <p className="text-sm text-gray-300">No streaming services available in your region. <a href={`https://www.google.com/search?q=${encodeURIComponent(movie.title)}+movie+watch+online`} target="_blank" rel="noopener noreferrer"><span className="text-blue-500">Google it!</span></a></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-8" />

      {/* Similar Movies */}
      <h1 className="text-2xl font-bold mb-4">{t.similar}</h1>
      {isLoadingSimilar ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <MovieImage key={index} isLoading={true} />
          ))}
        </div>
      ) : errorSimilar ? (
        <div className="text-center text-red-500">{errorSimilar}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {similarMovies.map((similarMovie) => (
            <Link href={`/movie/${similarMovie.tconst}`} key={similarMovie.tconst}>
              <div className="cursor-pointer">
                <MovieImage movie={similarMovie} width={500} height={750} className="w-full h-auto" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}