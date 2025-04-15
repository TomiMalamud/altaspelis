'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar({ currentQuery, placeholder, searchButtonText }) {
  const [query, setQuery] = useState(currentQuery || '');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex items-center h-10">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="text-md md:text-lg mr-2 h-full bg-black"
        name="search"
      />
      <Button type="submit" className="h-full">
        {searchButtonText}
      </Button>
    </form>
  );
} 