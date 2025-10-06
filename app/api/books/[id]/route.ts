import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

// Helper to format book data
function formatBook(book: any) {
  if (!book) return null;
  const genres = book.book_genres ? book.book_genres.map((bg: any) => bg.genres).filter(Boolean) : [];
  const { book_genres, ...rest } = book;
  return {
    ...rest,
    genres,
  };
}

// --- GET ---
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  try {
    const { data: book, error } = await supabase
      .from("books")
      .select("*, book_genres(*, genres(*)))")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!book) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(formatBook(book), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar livro." },
      { status: 500 }
    );
  }
}

// --- PATCH ---
type BookUpdateBody = {
  title?: string;
  author?: string;
  status?: string;
  genres?: { id: number }[];
  genreIds?: number[];
  pages?: number;
  currentPage?: number;
  totalPages?: number;
  rating?: number;
  coverUrl?: string;
  synopsis?: string;
  isbn?: number;
  notes?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as BookUpdateBody;

  if (Object.keys(body).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo alterado para atualização." },
      { status: 400 }
    );
  }

  try {
    const { genres, genreIds, ...rest } = body;
    const bookId = Number(id);

    // Update book details
    if (Object.keys(rest).length > 0) {
      const { error: updateError } = await supabase
        .from("books")
        .update(rest)
        .eq("id", bookId);

      if (updateError) {
        throw updateError;
      }
    }

    const newGenreIds = genreIds || (genres ? genres.map((g) => g.id) : null);

    if (newGenreIds) {
      // Delete existing genre associations
      await supabase.from("book_genres").delete().eq("book_id", bookId);

      // Insert new genre associations
      if (newGenreIds.length > 0) {
        const { error: insertError } = await supabase
          .from("book_genres")
          .insert(newGenreIds.map((genre_id) => ({ book_id: bookId, genre_id })));

        if (insertError) {
          throw insertError;
        }
      }
    }

    // Fetch the updated book with genres
    const { data: updatedBook, error: fetchError } = await supabase
      .from("books")
      .select("*, book_genres(*, genres(*)))")
      .eq("id", bookId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json(formatBook(updatedBook), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar livro." },
      { status: 500 }
    );
  }
}

// --- DELETE ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "ID é obrigatório para exclusão." },
      { status: 400 }
    );
  }

  try {
    const bookId = Number(id);

    // Delete genre associations first
    await supabase.from("book_genres").delete().eq("book_id", bookId);

    // Then delete the book
    await supabase.from("books").delete().eq("id", bookId);

    return NextResponse.json(
      { message: "Livro deletado com sucesso." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar livro." },
      { status: 500 }
    );
  }
}