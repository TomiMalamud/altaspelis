'use client';

import React, { useContext } from 'react';
import { LanguageContext } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { handleLanguageChange, t } = useContext(LanguageContext);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Globe className="h-5 w-5 text-gray-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>
            {t.english}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleLanguageChange('es_AR')}>
            {t.spanish}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher;