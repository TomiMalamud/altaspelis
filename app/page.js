'use client'
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [searchQuery]);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/movies?search=${searchQuery}`);
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

  const fetchSimilarMovies = async (tconst) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/recommend?tconst=${encodeURIComponent(tconst)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data.recommendations);
    } catch (error) {
      console.error('Error fetching similar movies:', error);
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
      <form onSubmit={handleSubmit} className="mb-4 flex items-center">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="text-lg h-10 mr-2"
        />
        <Button type="submit" className="mr-2 h-10">
          Search
        </Button>
      </form>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedMovie(null);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedMovie(null);
  };

  const handleMovieClick = (movie) => {
    fetchSimilarMovies(movie.tconst);
    setSelectedMovie(movie);
  };

  const renderMovieGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <div key={movie.tconst} className="cursor-pointer" onClick={() => handleMovieClick(movie)}>
          {movie.poster_path && (
            <Image 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              width={500}
              height={500}
              className="w-full h-auto rounded-t-lg"
            />
          )}
        </div>
      ))}
    </div>
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (    
    <div className="container mx-auto p-4">            
      <h1 className="text-2xl font-bold mb-4"><a href="/">Altas Pelis</a></h1>
      <SearchBar onSearch={handleSearch} onClear={handleClear} currentQuery={searchQuery} />
      {selectedMovie && (
        <p className="mb-4">Showing movies similar to: <strong>{selectedMovie.title}</strong></p>
      )}
      {isLoading ? (
        <div>Loading...</div>
      ) : (        
        renderMovieGrid()
      )}
    </div>
  );
};

export default MovieList;