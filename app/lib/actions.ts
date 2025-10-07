'use server'

import { revalidatePath } from 'next/cache';
import { Book } from '@/app/types/book';
import { supabase } from '@/lib/supabase';

// Server action to create a new book
export async function addBook(book: Omit<Book, 'id' | 'createdAt'>) {
    try {
        if (!book.title || !book.author || !book.status) {
            throw new Error('Título, autor e status são obrigatórios');
        }

        const genreArray = Array.isArray(book.genres) ? book.genres : [];

        // 1️⃣ Inserir livro
        const { data: bookData, error: bookError } = await supabase
            .from("books")
            .insert([{
                title: book.title,
                author: book.author,
                status: book.status,
                pages: book.pages ?? null,
                total_pages: book.totalPages ?? null,
                current_page: book.currentPage ?? null,
                rating: book.rating ?? null,
                cover_url: book.coverUrl ?? null,
                synopsis: book.synopsis ?? null,
                isbn: book.isbn ?? null,
                notes: book.notes ?? null,
            }])
            .select();

        if (bookError) throw bookError;
        const bookId = bookData[0].id;

        // 2️⃣ Inserir gêneros
        if (genreArray.length > 0) {
            const bookGenres = genreArray.map((g: any) => ({
                book_id: bookId,
                genre_id: g.id,
            }));
            const { error: bgError } = await supabase
                .from("book_genres")
                .insert(bookGenres);
            if (bgError) throw bgError;
        }

        revalidatePath('/books');
        
        // 3️⃣ Retornar livro completo
        return await getBook(String(bookId));
    } catch (error) {
        console.error('Error adding book:', error);
        throw error instanceof Error ? error : new Error('Erro ao adicionar livro');
    }
}

// Server action to update a book
export async function updateBook(id: string, book: Partial<Book>) {
    try {
        const payload = { ...book } as Record<string, unknown>;
        let genres = null;
        
        if ('genreIds' in payload && Array.isArray(payload.genreIds)) {
            genres = (payload.genreIds as number[]).map((id: number) => ({ id }));
            delete payload.genreIds;
        }
        if ('genres' in payload) {
            genres = payload.genres as any[];
            delete payload.genres;
        }

        const updateData: any = {};
        if (payload.title) updateData.title = payload.title;
        if (payload.author) updateData.author = payload.author;
        if (payload.status) updateData.status = payload.status;
        if (payload.pages !== undefined) updateData.pages = payload.pages;
        if (payload.totalPages !== undefined) updateData.total_pages = payload.totalPages;
        if (payload.currentPage !== undefined) updateData.current_page = payload.currentPage;
        if (payload.rating !== undefined) updateData.rating = payload.rating;
        if (payload.coverUrl !== undefined) updateData.cover_url = payload.coverUrl;
        if (payload.synopsis !== undefined) updateData.synopsis = payload.synopsis;
        if (payload.isbn !== undefined) updateData.isbn = payload.isbn;
        if (payload.notes !== undefined) updateData.notes = payload.notes;

        // Atualizar livro
        const { error } = await supabase
            .from("books")
            .update(updateData)
            .eq("id", Number(id));

        if (error) throw error;

        // Atualizar gêneros se fornecidos
        if (Array.isArray(genres)) {
            await supabase.from("book_genres").delete().eq("book_id", Number(id));
            
            if (genres.length > 0) {
                await supabase
                    .from("book_genres")
                    .insert(genres.map((g: any) => ({ book_id: Number(id), genre_id: g.id })));
            }
        }

        revalidatePath('/books');
        revalidatePath(`/books/${id}`);
        
        return await getBook(id);
    } catch (error) {
        console.error('Error updating book:', error);
        throw error instanceof Error ? error : new Error('Failed to update book');
    }
}

// Server action to delete a book
export async function deleteBook(id: string) {
    try {
        await supabase.from("book_genres").delete().eq("book_id", Number(id));
        
        const { error } = await supabase.from("books").delete().eq("id", Number(id));
        
        if (error) throw error;

        revalidatePath('/books');
        return true;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error instanceof Error ? error : new Error('Erro ao excluir o livro');
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
export async function addGenre(title: string) {
    try {
        const { data, error } = await supabase
            .from("genres")
            .insert([{ title }])
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/books');
        return data;
    } catch (error) {
        console.error('Error adding genre:', error);
        throw new Error('Failed to add genre');
    }
}

// Server action to delete a genre
export async function deleteGenre(id: string) {
    try {
        // Verificar se há livros usando este gênero
        const { data: booksWithGenre } = await supabase
            .from("book_genres")
            .select("*")
            .eq("genre_id", Number(id))
            .limit(1);

        if (booksWithGenre && booksWithGenre.length > 0) {
            throw new Error('Não é possível excluir um gênero que está sendo usado por livros');
        }

        const { error } = await supabase
            .from("genres")
            .delete()
            .eq("id", Number(id));

        if (error) throw error;

        revalidatePath('/books');
        return true;
    } catch (error) {
        console.error('Error deleting genre:', error);
        throw error instanceof Error ? error : new Error('Failed to delete genre');
    }
}