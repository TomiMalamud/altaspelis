'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import Link from 'next/link';
import MovieImage from '@/components/movie-image';
import SearchBar from '@/components/search-bar';
import { LanguageContext } from '@/context/language-context';

export default function MovieListClient({ initialMovies }) {
  const [movies, setMovies] = useState(initialMovies);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
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
    if (searchQuery) {
      fetchMovies();
    }
  }, [fetchMovies, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setHasSearched(false);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <SearchBar 
        onSearch={handleSearch} 
        currentQuery={searchQuery} 
        placeholder={t.searchPlaceholder}
        searchButtonText={t.searchButton}
      />
      {renderMovieGrid()}
    </div>
  );

  function renderMovieGrid() {
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
  }
} 