import Link from 'next/link';
import MovieImage from '@/components/movie-image';
import SearchBar from '@/components/search-bar';

export default function MovieList({ movies, searchQuery }) {
  return (
    <div className="container mx-auto">
      <SearchBar 
        currentQuery={searchQuery} 
        placeholder="Search movies, directors, actors..."
        searchButtonText="Search"
      />
      {renderMovieGrid()}
    </div>
  );

  function renderMovieGrid() {
    if (searchQuery && movies.length === 0) {
      return (
        <div className="text-center mt-32">
          <p className="text-xl font-semibold">No movies found for "{searchQuery}"</p>
          <p className="text-gray-400 font-light mt-2">Maybe the movie is too new or not popular enough to have a recommendation yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link href={`/movie/${movie.tconst}`} key={movie.tconst} prefetch={false}>
            <MovieImage movie={movie} />
          </Link>
        ))}
      </div>
    );
  }
} 