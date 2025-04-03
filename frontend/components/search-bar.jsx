'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar({ onSearch, currentQuery, placeholder, searchButtonText }) {
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
        placeholder={placeholder}
        className="text-md md:text-lg mr-2 h-full bg-black"
      />
      <Button type="submit" className="h-full">
        {searchButtonText}
      </Button>
    </form>
  );
} 