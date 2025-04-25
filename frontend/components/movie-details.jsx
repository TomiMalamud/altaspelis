import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MovieImage from '@/components/movie-image';

export default function MovieDetails({ movie, similarMovies }) {
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
          <p className="mb-4 text-slate-400">{movie.overview}</p>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-x-2 mb-6">
            {movie.genres && movie.genres.split(' ').map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-sm cursor-pointer-events-none">
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
                <span className="text-gray-500">Director:</span> {movie.director_names}
              </p>
            )}
            {movie.actor_names && (
              <p className="text-gray-300">
                <span className="text-gray-500">Stars:</span> {movie.actor_names.split(' ').reduce((acc, curr, i, arr) => {
                  if (i % 2 === 0) {
                    return acc + (i > 0 ? ', ' : '') + curr;
                  }
                  return acc + ' ' + curr;
                }, '')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-6">
            {/* IMDb Rating */}
            <div className="w-full sm:w-auto">
              <a href={`https://www.imdb.com/title/${movie.tconst}/ratings`} target="_blank" rel="noopener noreferrer">
                <p className="text-sm font-semibold mb-2 tracking-widest text-gray-400">IMDb Rating</p>
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
                        votes
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            </div>            
          </div>
        </div>
      </div>

      {/* Separator */}
      <Separator className="my-8" />

      {/* Similar Movies */}
      <h1 className="text-2xl font-bold mb-4">Similar Movies</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {similarMovies.map((similarMovie) => (
          <Link href={`/movie/${similarMovie.tconst}`} key={similarMovie.tconst} prefetch={false}>
            <div className="cursor-pointer">
              <MovieImage movie={similarMovie} width={500} height={750} className="w-full h-auto" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 