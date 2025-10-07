"use client";

import { useState, useCallback, useEffect } from "react";
import { useBooks } from "../contexts/BookContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Link from "next/link";

export default function Home() {
  const { books, isLoading, error, refreshBooks } = useBooks();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = useCallback(async () => {
    await refreshBooks();
    setLastUpdate(new Date());
  }, [refreshBooks]);

  // Atualiza a última atualização quando os dados são carregados
  useEffect(() => {
    if (!isLoading && books.length > 0) {
      setLastUpdate(new Date());
    }
  }, [isLoading, books]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Erro</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: books.length,
    reading: books.filter((book) => book.status === "READING").length,
    finished: books.filter((book) => book.status === "FINISHED").length,
    read: books.filter((book) => book.status === "READ").length,
    toRead: books.filter((book) => book.status === "TO_READ").length,
    paused: books.filter((book) => book.status === "PAUSED").length,
    abandoned: books.filter((book) => book.status === "ABANDONED").length,
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Bem-vindo à sua biblioteca pessoal
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${isLoading ? "animate-spin" : ""}`}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
            </svg>
            {isLoading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Livros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.total
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Lendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.reading
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Para Ler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.toRead
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Lidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.read
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Finalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.finished
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pausados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-yellow-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.paused
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Abandonados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                stats.abandoned
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link
          href="/books"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          Ver Todos os Livros
        </Link>
        <Link
          href="/books/add"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adicionar Novo Livro
        </Link>
      </div>
    </div>
  );
}