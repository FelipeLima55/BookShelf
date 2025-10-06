import { supabase } from "../../../../lib/supabase";
import { Genre } from "../../../types/book";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body: Partial<Genre> = await request.json();
  const { title, description } = body;

  if (!id) {
    return Response.json(
      { error: "ID é obrigatório para atualização." },
      { status: 400 }
    );
  }

  try {
    const { data: updatedGenre, error } = await supabase
      .from("genres")
      .update({ title, description })
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return Response.json(updatedGenre, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Erro ao atualizar gênero." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return Response.json(
      { error: "ID é obrigatório para exclusão." },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("genres").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return Response.json(
      { message: "Gênero deletado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Erro ao deletar gênero." },
      { status: 500 }
    );
  }
}