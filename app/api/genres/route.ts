import { supabase } from "../../../lib/supabase";
import { Genre } from "@/app/types/book";

export async function GET() {
  const { data: genres, error } = await supabase
    .from("genres")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(genres);
}

export async function POST(request: Request) {
  const body: Genre = await request.json();

  const { title, description } = body;

  if (!title) {
    return Response.json({ error: "Título é obrigatório." }, { status: 400 });
  }

  try {
    const { data: newGenre, error } = await supabase
      .from("genres")
      .insert([{ title, description }])
      .select();

    if (error) {
      throw error;
    }

    return Response.json(newGenre, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Erro ao criar gênero." }, { status: 500 });
  }
}
