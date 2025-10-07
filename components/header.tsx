"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow transition-colors duration-300 border-b relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            📚 Minha Biblioteca
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/"><Button variant="ghost">Início</Button></Link>
            <Link href="/books"><Button variant="ghost">Livros</Button></Link>
            <Link href="/books/add"><Button variant="ghost">Adicionar Livro</Button></Link>
          </nav>

          {/* Mobile menu button + ThemeToggle sempre visível */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-900 dark:text-gray-100 focus:outline-none text-2xl"
            >
              {isMenuOpen ? "✖️" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav menu sliding */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-40
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col mt-16 px-4 space-y-4">
          <Link href="/"><Button variant="ghost" className="w-full text-left">Início</Button></Link>
          <Link href="/books"><Button variant="ghost" className="w-full text-left">Livros</Button></Link>
          <Link href="/books/add"><Button variant="ghost" className="w-full text-left">Adicionar Livro</Button></Link>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
        />
      )}
    </header>
  );
};

export default Header;
