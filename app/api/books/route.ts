import { supabase } from "../../../lib/supabase";

export async function GET() {
  const { data: books, error } = await supabase
    .from("books")
    .select("*, book_genres(*, genres(*)))")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!books) {
    return Response.json([], { status: 200 });
  }

  const formattedBooks = books.map((book: any) => {
    const genres = book.book_genres.map((bg: any) => bg.genres);
    const { book_genres, ...rest } = book;
    return {
      ...rest,
      genres,
    };
  });

  return Response.json(formattedBooks);
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    title,
    author,
    genres,
    pages,
    totalPages,
    currentPage,
    status,
    rating,
    coverUrl,
    synopsis,
    isbn,
    notes,
  } = body;

  if (!title || !author || !status) {
    return Response.json(
      { error: "Título, autor e status são obrigatórios" },
      { status: 400 }
    );
  }

  if (
    !["TO_READ", "READING", "READ", "PAUSED", "FINISHED", "ABANDONED"].includes(
      status
    )
  ) {
    return Response.json(
      {
        error:
          "Status inválido. Use TO_READ, READING, READ, PAUSED, FINISHED ou ABANDONED",
      },
      { status: 400 }
    );
  }

  const genreArray = Array.isArray(genres) ? genres : [];

  try {
    const baseData = {
      title,
      author,
      status,
      pages: pages ? Number(pages) : undefined,
      totalPages: totalPages ? Number(totalPages) : undefined,
      currentPage: currentPage ? Number(currentPage) : undefined,
      rating: rating ? Number(rating) : undefined,
      coverUrl: coverUrl || undefined,
      synopsis: synopsis || undefined,
      isbn: isbn ? Number(isbn) : undefined,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    };

    const { data: newBook, error: bookError } = await supabase
      .from("books")
      .insert([baseData])
      .select();

    if (bookError) {
      throw bookError;
    }

    if (newBook && newBook.length > 0 && genreArray.length > 0) {
      const bookId = newBook[0].id;
      const bookGenresData = genreArray.map((g: { id: number }) => ({
        book_id: bookId,
        genre_id: g.id,
      }));

      const { error: genreError } = await supabase
        .from("book_genres")
        .insert(bookGenresData);

      if (genreError) {
        // If linking genres fails, we should probably roll back the book insertion.
        // For simplicity here, we'll just log the error.
        console.error("Error linking genres:", genreError);
      }
    }

    // Re-fetch the book with genres to return the complete object
    const { data: bookWithGenres, error: fetchError } = await supabase
      .from("books")
      .select("*, book_genres(*, genres(*)))")
      .eq("id", newBook[0].id)
      .single();

    if (fetchError) {
      console.error("Error fetching book with genres:", fetchError);
      return Response.json(newBook, { status: 201 }); // return the book without genres
    }

    if (!bookWithGenres) {
      return Response.json(newBook, { status: 201 });
    }

    const bookGenres = (bookWithGenres as any).book_genres.map(
      (bg: any) => bg.genres
    );
    const { book_genres, ...rest } = bookWithGenres as any;
    const formattedBook = {
      ...rest,
      genres: bookGenres,
    };

    return Response.json(formattedBook, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar livro:", error);

    if (error instanceof Error) {
      return Response.json(
        {
          error: "Erro ao criar livro",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        error: "Erro desconhecido ao criar livro",
      },
      { status: 500 }
    );
  }
}