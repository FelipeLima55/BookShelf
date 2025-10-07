'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { BookProvider } from '../contexts/BookContext';
import Header from './header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BookProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              {/* Conteúdo principal da página */}
              {children}
            </div>
          </main>
        </div>
      </BookProvider>
    </ThemeProvider>
  );
}
