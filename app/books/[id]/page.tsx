import { getBook } from "@/app/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientBookControls } from "./ClientControls";
import { notFound } from "next/navigation";

const statusLabels: Record<string, string> = {
  TO_READ: "Para Ler",
  READING: "Lendo",
  READ: "Lido",
  PAUSED: "Pausado",
  FINISHED: "Finalizado",
  ABANDONED: "Abandonado",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { id } = await params;
  let book;
  try {
    book = await getBook(id);
  } catch (error) {
    notFound();
  }

  const progress = book.totalPages
    ? Math.round(((book.currentPage || 0) / book.totalPages) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header com botões */}
      <ClientBookControls book={book} />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Capa do livro */}
            {book.coverUrl && (
              <div className="flex-shrink-0">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-48 h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Informações principais */}
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">por {book.author}</p>

              {/* Badge de Status */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  book.status === "FINISHED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : book.status === "READING"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : book.status === "PAUSED"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : book.status === "ABANDONED"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : book.status === "READ"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {statusLabels[book.status]}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {book.genres && book.genres.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Gêneros</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {book.genres.map((genre: { id: number; title: string }) => (
                    <span
                      key={genre.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {genre.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {book.totalPages && (
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Total de Páginas</h3>
                <p className="text-gray-900 dark:text-gray-100">{book.totalPages}</p>
              </div>
            )}

            {book.currentPage !== undefined && (
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Página Atual</h3>
                <p className="text-gray-900 dark:text-gray-100">{book.currentPage}</p>
              </div>
            )}

            {book.isbn && (
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">ISBN</h3>
                <p className="text-gray-900 dark:text-gray-100">{book.isbn}</p>
              </div>
            )}

            {book.rating && (
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Avaliação</h3>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < book.rating! ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400">({book.rating}/5)</span>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Adicionado em</h3>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(book.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          {book.totalPages && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  Progresso de Leitura
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {book.currentPage || 0}/{book.totalPages} ({progress}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Sinopse */}
          {book.synopsis && (
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sinopse</h3>
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{book.synopsis}</p>
            </div>
          )}

          {/* Notas */}
          {book.notes && (
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Minhas Notas</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {book.notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}