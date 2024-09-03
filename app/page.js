'use client'
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, [searchQuery]);

  const fetchMovies = async () => {
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
  };

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

  const renderMovieGrid = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <Link href={`/movie/${movie.tconst}`} key={movie.tconst}>
          <div className="cursor-pointer">
            {movie.poster_path && (
              <Image 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={`${movie.title} poster`}
                width={500}
                height={500}
                className="w-full h-auto rounded-sm transition-all duration-200 hover:opacity-90"
              />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (    
    <div className="container mx-auto">            
      <SearchBar onSearch={handleSearch} onClear={handleClear} currentQuery={searchQuery} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (        
        renderMovieGrid()
      )}
    </div>
  );
};

export default MovieList;