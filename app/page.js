'use client'
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://tmalamud.pythonanywhere.com/api/movies?search=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
    }
    setIsLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const SearchBar = ({ onSearch, onClear, currentQuery }) => {
    const [query, setQuery] = useState(currentQuery);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSearch(query);
    };

    const handleClear = () => {
      setQuery('');
      onClear();
    };
  
    return (
      <form onSubmit={handleSubmit} className="mb-4 flex items-center h-10">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="text-lg mr-2 h-full bg-black"
        />
        <Button type="submit" className="h-full">
          Search
        </Button>
      </form>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const MovieImage = ({ movie }) => {
    const [src, setSrc] = useState(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
    const [isLoading, setIsLoading] = useState(true);

    return (
      <div className="relative aspect-[2/3] w-full">
        {isLoading && (
          <Skeleton className="absolute inset-0" />
        )}
        <Image 
          src={src}
          alt={`${movie.title} poster`}
          layout="fill"
          objectFit="cover"
          className={`rounded-sm transition-all duration-200 hover:opacity-90 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={onError}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>
    );
  };

  const MovieSkeleton = () => (
    <div className="relative aspect-[2/3] w-full">
      <Skeleton className="absolute inset-0" />
    </div>
  );

  const renderMovieGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {isLoading
        ? Array.from({ length: 10 }).map((_, index) => (
            <MovieSkeleton key={index} />
          ))
        : movies.map((movie) => (
            <Link href={`/movie/${movie.tconst}`} key={movie.tconst}>
              <div className="cursor-pointer">
                {movie.poster_path && <MovieImage movie={movie} />}
              </div>
            </Link>
          ))}
    </div>
  );
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (    
    <div className="container mx-auto min-h-screen">            
      <SearchBar onSearch={handleSearch} onClear={handleClear} currentQuery={searchQuery} />
      {renderMovieGrid()}
    </div>
  );
};

export default MovieList;