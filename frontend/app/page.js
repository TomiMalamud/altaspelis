'use client';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MovieImage from '@/components/movie-image';
import { LanguageContext } from '@/context/language-context';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Consume language from context
  const { t } = useContext(LanguageContext);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://tmalamud.pythonanywhere.com/api/movies?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`${t.errorFetching}${response.status}`);
      }
      const data = await response.json();
      setMovies(data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
    }
    setIsLoading(false);
    setHasSearched(true);
  }, [searchQuery, t]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const SearchBar = ({ onSearch, onClear, currentQuery }) => {
    const [query, setQuery] = useState(currentQuery);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSearch(query);
    };

    return (
      <form onSubmit={handleSubmit} className="mb-4 flex items-center h-10">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="text-md md:text-lg mr-2 h-full bg-black"
        />
        <Button type="submit" className="h-full">
          {t.searchButton}
        </Button>
      </form>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setHasSearched(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setHasSearched(false);
  };

  const renderMovieGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <MovieImage key={index} isLoading={true} />
          ))}
        </div>
      );
    }

    if (hasSearched && movies.length === 0) {
      return (
        <div className="text-center mt-32">
          <p className="text-xl font-semibold">{t.noMoviesFound}</p>
          <p className="text-gray-400 font-light mt-2">{t.noMoviesMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link href={`/movie/${movie.tconst}`} key={movie.tconst}>
            <MovieImage movie={movie} />
          </Link>
        ))}
      </div>
    );
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <SearchBar onSearch={handleSearch} onClear={handleClear} currentQuery={searchQuery} />
      {renderMovieGrid()}
    </div>
  );
};

export default MovieList;