'use client';

import React, { createContext, useState, useEffect } from 'react';

const translations = {
  en: {
    searchPlaceholder: "Search movies, directors, actors...",
    searchButton: "Search",
    stars: "Stars",
    whereToWatch: "WHERE TO WATCH",
    similar: "Similar Movies",
    noMoviesFound: "No movies found",
    noMoviesMessage: "Maybe the movie is too new or not popular enough to have a recommendation yet.",
    errorFetching: "We have a problem fetching the movies: ",
    languageLabel: "Language",
    english: "Inglés",
    spanish: "Español",    
  },
  es_AR: {
    searchPlaceholder: "Buscar películas, directores, actores...",
    searchButton: "Buscar",
    stars: "Actores",
    whereToWatch: "DÓNDE VER",
    similar: "Películas Similares",
    noMoviesFound: "No se encontraron películas",
    noMoviesMessage: "Quizás la película es muy nueva o no es lo suficientemente popular como para tener una recomendación todavía.",
    errorFetching: "Tenemos un problema al obtener las películas: ",
    languageLabel: "Idioma",
    english: "English",
    spanish: "Spanish",
  }
};

// Language Context
export const LanguageContext = createContext();

// Language Provider
export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en'); // Default to English

  useEffect(() => {
    // First check localStorage for user's previous preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      setLang(savedLanguage);
      return;
    }

    // If no saved preference, check browser's language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      setLang('es_AR');
      localStorage.setItem('preferredLanguage', 'es_AR');
      return;
    }

    // Default to English for all other cases
    setLang('en');
    localStorage.setItem('preferredLanguage', 'en');
  }, []);

  // Function to handle language change
  const handleLanguageChange = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('preferredLanguage', newLang);
    }
  };

  // Reference to the translations based on the current language
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  );
};