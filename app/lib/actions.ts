'use server'

import { revalidatePath } from 'next/cache';
import { Book } from '@/app/types/book';
import { supabase } from '@/lib/supabase';

// Função auxiliar para construir URLs absolutas
function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

const BASE_URL = getBaseUrl();

// Server action to create a new book
export async function addBook(book: Omit<Book, 'id' | 'createdAt'>) {
    try {
        if (!book.title || !book.author || !book.status) {
            throw new Error('Título, autor e status são obrigatórios');
        }

        const response = await fetch(`${BASE_URL}/api/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: 'Erro na resposta do servidor',
                details: `Status: ${response.status}`
            }));

            if (response.status === 400) {
                throw new Error(errorData.error || 'Dados inválidos fornecidos');
            } else if (response.status === 500) {
                throw new Error(errorData.error + (errorData.details ? `: ${errorData.details}` : ''));
            } else {
                throw new Error(errorData.error || 'Erro ao adicionar livro');
            }
        }

        revalidatePath('/books');
        const newBook = await response.json();
        return newBook;
    } catch (error) {
        console.error('Error adding book:', error);
        throw error instanceof Error ? error : new Error('Erro ao adicionar livro');
    }
}

// Server action to update a book
export async function updateBook(id: string, book: Partial<Book>) {
    const payload = { ...book } as Record<string, unknown>;
    if ('genreIds' in payload && Array.isArray(payload.genreIds)) {
        payload.genres = (payload.genreIds as number[]).map((id: number) => ({ id }));
        delete payload.genreIds;
    }

    const response = await fetch(`${BASE_URL}/api/books/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to update book');
    }

    revalidatePath('/books');
    revalidatePath(`/books/${id}`);
    return response.json();
}

// Server action to delete a book
export async function deleteBook(id: string) {
    try {
        const response = await fetch(`${BASE_URL}/api/books/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            if (response.status === 404) {
                throw new Error('Livro não encontrado');
            } else {
                throw new Error(errorData.error || 'Erro ao excluir o livro');
            }
        }

        revalidatePath('/books');
        return true;
    } catch (error) {
        console.error('Error deleting book:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erro ao excluir o livro. Por favor, tente novamente.');
    }
}

// Server action to get a book by ID
export async function getBook(id: string) {
    try {
        const { data, error } = await supabase
            .from("books")
            .select(`
                *,
                book_genres(
                    genre_id,
                    genres(id, title)
                )
            `)
            .eq("id", Number(id))
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            author: data.author,
            status: data.status,
            pages: data.pages,
            totalPages: data.total_pages,
            currentPage: data.current_page,
            rating: data.rating,
            coverUrl: data.cover_url,
            synopsis: data.synopsis,
            isbn: data.isbn,
            notes: data.notes,
            createdAt: data.created_at,
            genres: (data.book_genres ?? []).map((bg: any) => ({
                id: bg.genres?.id,
                title: bg.genres?.title ?? "",
            })),
        };
    } catch (error) {
        console.error('Error fetching book:', error);
        throw new Error('Book not found');
    }
}

// Server action to get all books
export async function getBooks() {
    try {
        const { data, error } = await supabase
            .from("books")
            .select(`
                *,
                book_genres(
                    genre_id,
                    genres(id, title)
                )
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const books = (data ?? []).map((book: any) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            status: book.status,
            pages: book.pages,
            totalPages: book.total_pages,
            currentPage: book.current_page,
            rating: book.rating,
            coverUrl: book.cover_url,
            synopsis: book.synopsis,
            isbn: book.isbn,
            notes: book.notes,
            createdAt: book.created_at,
            genres: (book.book_genres ?? []).map((bg: any) => ({
                id: bg.genres?.id,
                title: bg.genres?.title ?? "",
            })),
        }));

        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw new Error('Failed to fetch books');
    }
}

// Server action to get all genres
export async function getGenres() {
    try {
        const { data, error } = await supabase
            .from("genres")
            .select("*")
            .order("title", { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching genres:', error);
        throw new Error('Failed to fetch genres');
    }
}

// Server action to add a new genre
export async function addGenre(genre: string) {
    const response = await fetch(`${BASE_URL}/api/genres`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre }),
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to add genre');
    }

    revalidatePath('/books');
    return response.json();
}

// Server action to delete a genre
export async function deleteGenre(genre: string) {
    const response = await fetch(
        `${BASE_URL}/api/genres/${encodeURIComponent(genre)}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        }
    );

    if (!response.ok) {
        throw new Error('Failed to delete genre');
    }

    revalidatePath('/books');
    return true;
}