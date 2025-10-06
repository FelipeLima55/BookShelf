import { supabase } from "../../../../lib/supabase";

// --- GET ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  
  if (!id) {
    return Response.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      book_genres(
        genre_id,
        genres(id, title)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return Response.json(
      { error: "Erro ao buscar livro", details: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ...data,
    totalPages: data.total_pages,
    currentPage: data.current_page,
    coverUrl: data.cover_url,
    createdAt: data.created_at,
    genres: (data.book_genres ?? []).map((bg: any) => ({
      id: bg.genres?.id,
      title: bg.genres?.title ?? "",
    })),
  });
}

// PATCH - atualizar livro
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id: paramId } = await params;
  const id = Number(paramId);
  const body = await request.json();

  if (!id) {
    return Response.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  if (!body || Object.keys(body).length === 0) {
    return Response.json(
      { error: "Nenhum campo alterado." },
      { status: 400 }
    );
  }

  try {
    const { genres, totalPages, currentPage, coverUrl, book_genres, created_at, createdAt, ...rest } = body;

    const updateData: any = {
      ...rest,
    };

    if (totalPages !== undefined) updateData.total_pages = totalPages;
    if (currentPage !== undefined) updateData.current_page = currentPage;
    if (coverUrl !== undefined) updateData.cover_url = coverUrl;

    const { error } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    // Atualizar gêneros se fornecidos
    if (Array.isArray(genres)) {
      await supabase.from("book_genres").delete().eq("book_id", id);
      
      if (genres.length > 0) {
        await supabase
          .from("book_genres")
          .insert(genres.map((g: any) => ({ book_id: id, genre_id: g.id })));
      }
    }

    // Buscar o livro atualizado
    const { data: bookData } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    // Buscar os gêneros separadamente
    const { data: bookGenresData } = await supabase
      .from("book_genres")
      .select("genre_id, genres(id, title)")
      .eq("book_id", id);

    const updatedBook = {
      ...bookData,
      book_genres: bookGenresData || []
    };

    return Response.json({
      ...updatedBook,
      totalPages: updatedBook?.total_pages,
      currentPage: updatedBook?.current_page,
      coverUrl: updatedBook?.cover_url,
      createdAt: updatedBook?.created_at,
      genres: (updatedBook?.book_genres ?? []).map((bg: any) => ({
        id: bg.genres?.id,
        title: bg.genres?.title ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Erro ao atualizar livro", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// --- DELETE ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paramId } = await params;
  const id = Number(paramId);
  
  if (!id) {
    return Response.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  try {
    await supabase.from("book_genres").delete().eq("book_id", id);
    
    const { error } = await supabase.from("books").delete().eq("id", id);
    
    if (error) throw error;

    return Response.json({ message: "Livro deletado com sucesso." });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Erro ao deletar livro", details: (err as Error).message },
      { status: 500 }
    );
  }
}