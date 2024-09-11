import React, { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const MovieImage = ({ 
  movie, 
  width = 500, 
  height = 750, 
  isLoading = false, 
  className = "" 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className={`relative aspect-[2/3] w-full ${className}`}>
      {(isLoading || imageLoading) && (
        <Skeleton className="absolute inset-0" />
      )}
      {!isLoading && (
        <Image 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie?.title ? `${movie.title} poster` : 'Movie poster'}
          width={width}
          height={height}
          className={`rounded-sm transition-all duration-200 hover:opacity-90 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      )}
      {imageError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          Image not available
        </div>
      )}
    </div>
  );
};

export default MovieImage;