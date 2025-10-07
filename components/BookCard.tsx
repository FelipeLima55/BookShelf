"use client";

import { Book } from "@/app/types/book";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import DeleteBookModal from "@/app/components/DeleteBookModal";
import { deleteBook } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

const statusLabels = {
  TO_READ: "Para Ler",
  READING: "Lendo",
  READ: "Lido",
  PAUSED: "Pausado",
  FINISHED: "Finalizado",
  ABANDONED: "Abandonado",
} as const;

// Status colors for light and dark mode
const statusColors = {
  TO_READ: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  READING: "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100",
  READ: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
  PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
  FINISHED: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
  ABANDONED: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100",
} as const;

interface BookCardProps {
  book: Book;
}

export function ClientBookCard({ book }: BookCardProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await deleteBook(book.id.toString());
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 rounded-lg">
        <CardHeader>
          <div className="flex gap-4">
            {/* Capa do livro */}
            {book.coverUrl && (
              <div className="hidden sm:block flex-shrink-0">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-24 h-36 object-cover rounded-lg shadow-sm dark:shadow-md transition-shadow duration-300"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-2 text-gray-900 dark:text-gray-100">
                  {book.title}
                </CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[book.status]}`}
                >
                  {statusLabels[book.status]}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                por {book.author}
              </p>

              {/* Gêneros */}
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {book.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-700 text-blue-700 dark:text-white border border-blue-100 dark:border-blue-600 transition-colors duration-300"
                    >
                      {genre.title}
                    </span>
                  ))}
                  {book.genres.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                      +{book.genres.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {book.totalPages && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Páginas:</span> {book.totalPages}
                </p>
              )}
              {book.currentPage !== undefined && book.totalPages && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Progresso:</span>{" "}
                  {Math.round((book.currentPage / book.totalPages) * 100)}%
                </p>
              )}
              {book.rating && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-1">Avaliação:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < book.rating! ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sinopse resumida */}
            {book.synopsis && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {book.synopsis}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Link href={`/books/${book.id}`} className="flex-1">
                <button className="w-full px-3 py-2 text-sm text-blue-600 dark:text-white border border-blue-200 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors duration-300">
                  Ver Detalhes
                </button>
              </Link>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-3 py-2 text-sm bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-300"
                title="Excluir livro"
              >
                🗑️
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Exclusão */}
      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        bookTitle={book.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
