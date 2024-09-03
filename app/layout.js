import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Great Movies",
  description: "Find movies similar to your favorites with The Great Movies app. Discover new films based on what you love, expanding your movie-watching options effortlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">    
      <body className={`${inter.className} p-6 pt-10 md:p-10 text-gray-200 bg-gradient-to-br from-slate-900/80 to-black`}>
      <header>
      <h1 className="text-2xl font-bold mb-4"><a href="/">The Great Movies</a></h1>
      </header>
      {children}
        {/* <footer className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-2">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB</p>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/tmdb_logo.svg" 
              alt="The Movie Database (TMDB) Logo" 
              className="h-2 mx-auto"
            />
          </a>
        </footer> */}
        <Analytics />
      </body>
    </html>
  );
}
