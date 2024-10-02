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
    // Fetch the default language from the backend
    fetch('/api/default_language')
      .then(response => response.json())
      .then(data => {
        if (data.default_language && translations[data.default_language]) {
          setLang(data.default_language);
          localStorage.setItem('preferredLanguage', data.default_language);
        }
      })
      .catch(error => {
        console.error('Error fetching default language:', error);
      });
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