import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

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
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: { genres: true },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(book, { status: 200 });
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
    const data: any = { ...rest };
    const bookId = Number(id);

    if (genreIds) {
      data.genres = {
        set: genreIds.map((id) => ({ id: Number(id) })),
      };
    } else if (genres) {
      data.genres = {
        set: genres.map((g) => ({ id: Number(g.id) })),
      };
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data,
      include: { genres: true },
    });

    return NextResponse.json(updatedBook, { status: 200 });
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
    await prisma.book.delete({ where: { id: Number(id) } });

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
