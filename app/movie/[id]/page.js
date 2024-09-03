'use client'

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function MovieDetails() {
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        const [movieResponse, similarMoviesResponse, watchProvidersResponse] = await Promise.all([
          fetch(`https://tmalamud.pythonanywhere.com/api/movie/${id}`),
          fetch(`https://tmalamud.pythonanywhere.com/api/recommend?tconst=${id}`),
          fetch(`/api/movie-providers?id=${id}`)
        ]);

        if (!movieResponse.ok || !similarMoviesResponse.ok || !watchProvidersResponse.ok) {
          throw new Error(`HTTP error! status: ${movieResponse.status} ${similarMoviesResponse.status} ${watchProvidersResponse.status}`);
        }

        const [movieData, similarMoviesData, watchProvidersData] = await Promise.all([
          movieResponse.json(),
          similarMoviesResponse.json(),
          watchProvidersResponse.json()
        ]);

        setMovie(movieData);
        setSimilarMovies(similarMoviesData.recommendations);
        setWatchProviders(watchProvidersData.results.AR);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(error.message);
      }
      setIsLoading(false);
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>No movie found</div>;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row mb-8">
        <div className="w-full md:w-3/12 md:hidden">
          {movie.backdrop_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
              alt={`${movie.title} backdrop`}
              width={1280}
              height={720}
              className="w-full rounded-lg object-cover h-48"
            />
          )}
        </div>
        <div className="w-5/12 mx-auto md:w-3/12 hidden md:block">
          {movie.poster_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              width={500}
              height={750}
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <p className="text-lg mb-4 text-gray-400">{movie.overview}</p>
          <p className="text-lg text-gray-300 mb-4">{movie.release_date ? `${movie.release_date.split('-')[0]}` : ''} · {Math.floor(movie.runtimeMinutes / 60)}h {movie.runtimeMinutes % 60}min</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genres.split(' ').map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {genre}
              </Badge>
            ))}
          </div>
          <div className='flex flex-col sm:flex-row w-full gap-6'>
            <div className="w-full sm:w-auto">
              <a href={`https://www.imdb.com/title/${movie.tconst}/ratings`} target="_blank" rel="noopener noreferrer">
                <p className="text-sm font-semibold mb-2 tracking-widest text-gray-400">IMDb RATING</p>
                <Card className='px-6 py-4 bg-gradient-to-br from-yellow-100/10 to-black transition-all hover:to-yellow-100/10' style={{ borderColor: '#f5c518' }}>
                  <div className="flex items-center">
                    <Star className='h-10 w-10' style={{ color: "#f5c518" }} />
                    <div className='ml-4'>
                      <p className="text-xl font-bold">{movie.averageRating} <span className="text-gray-400 text-sm font-normal">/10</span></p>
                      <p className="text-sm font-light text-gray-400">
                        {movie.numVotes >= 1000000
                          ? `${(movie.numVotes / 1000000).toFixed(0)}M`
                          : movie.numVotes >= 1000
                            ? `${(movie.numVotes / 1000).toFixed(0)}K`
                            : movie.numVotes} votes
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            </div>
            <div className="w-full sm:w-auto">
              <h3 className="text-sm font-semibold mb-2 tracking-widest text-gray-400">WHERE TO WATCH</h3>
              {watchProviders && watchProviders.flatrate ? (
                <Card className='p-4'>
                  <div>
                    <a href={watchProviders.link} target="_blank" rel="noopener noreferrer">
                      <div className="flex flex-wrap justify-center gap-x-6">
                        {watchProviders.flatrate.map((provider) => (
                          <div key={provider.provider_id} className="flex items-center">
                            <Image
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

      <Separator className='my-8' />

      <h1 className="text-2xl font-bold mb-4">Similar Movies</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {similarMovies.map((movie) => (
          <Link href={`/movie/${movie.tconst}`} key={movie.tconst}>
            <div className="cursor-pointer">
              {movie.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-sm"
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}