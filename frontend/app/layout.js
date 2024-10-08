import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Separator } from "@/components/ui/separator"
import { LanguageProvider } from "@/context/language-context";
import LanguageSwitcher from "@/components/language-switcher"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Altas Pelis",
  description: "Encontrá películas parecidas a tus favoritas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <LanguageProvider>

          <div className={`${inter.className} p-6 pt-10 md:p-10 text-gray-200 bg-gradient-to-br from-slate-900/80 to-black`}>
            <header className="flex items-center mb-8 justify-between">
              <div className="flex items-center">
                <a href="/" className="flex items-center">
                  <img src="/logo.png" alt="Altas Pelis" className="h-10 mr-4 hover:animate-spin" />
                  <h1 className="text-2xl font-bold">Altas Pelis</h1>
                </a>
              </div>
              <LanguageSwitcher />

            </header>
            <main className="min-h-screen">
              {children}
            </main>
            <Separator className="my-12" />
            <footer className="text-center items-center">
              <div className="flex items-center">
                <p className="text-sm text-gray-400">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB. It also uses JustWatch.</p>
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/tmdb_logo.svg"
                    alt="The Movie Database (TMDB) Logo"
                    className="h-2 ml-2"
                  />
                </a>
              </div>
              <p className="text-center mt-2 text-sm leading-loose text-muted-foreground md:text-left">
                Built by{" "}
                <a
                  href="https://www.tmalamud.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  Tomás Malamud
                </a>
                . The source code is available on{" "}
                <a
                  href="https://github.com/TomiMalamud/altaspelis"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  GitHub
                </a>
                .
              </p>
            </footer>
            <Analytics />
          </div>
        </LanguageProvider>

      </body>
    </html>
  );
}
