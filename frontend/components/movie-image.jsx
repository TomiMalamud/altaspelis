import Image from 'next/image';

const MovieImage = ({
  movie,
  width = 500,
  height = 750,
  className = ""
}) => {
  return (
    <div className={`relative aspect-[2/3] w-full ${className}`}>
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie?.title ? `${movie.title} poster` : 'Movie poster'}
          width={width}
          height={height}
          className="rounded-sm transition-opacity duration-300 hover:opacity-90"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-secondary text-secondary-foreground">
          No Poster
        </div>
      )}
    </div>
  );
};

export default MovieImage;