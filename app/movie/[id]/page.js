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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        const [movieResponse, similarMoviesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/movie/${id}`),
          fetch(`http://localhost:5000/api/recommend?tconst=${id}`)
        ]);

        if (!movieResponse.ok || !similarMoviesResponse.ok) {
          throw new Error(`HTTP error! status: ${movieResponse.status} ${similarMoviesResponse.status}`);
        }

        const [movieData, similarMoviesData] = await Promise.all([
          movieResponse.json(),
          similarMoviesResponse.json()
        ]);

        setMovie(movieData);
        setSimilarMovies(similarMoviesData.recommendations);
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row mb-8">
        <div className=" w-3/12">
          {movie.poster_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              width={500}
              height={500}
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <p className="text-lg mb-4 text-gray-400">{movie.overview}</p>
          <p className="text-lg text-gray-300 mb-4">{Math.floor(movie.runtimeMinutes / 60)}h {movie.runtimeMinutes % 60}min</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.split(' ').map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {genre}
              </Badge>
            ))}
          </div>
          <div>
          <a href={`https://www.imdb.com/title/${movie.tconst}/ratings`} target="_blank" rel="noopener noreferrer">
            <p className="text-sm font-semibold mb-1 tracking-widest text-gray-400">IMDb RATING</p>
            <Card className='p-4 w-3/12 bg-gradient-to-br from-yellow-100/10 to-black trasition transition-all hover:to-yellow-100/10' style={{ borderColor: '#f5c518' }}>
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
        </div>
      </div>
      <Separator className='my-8'/>
      <h1 className="text-2xl font-bold mb-4">Similar Movies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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