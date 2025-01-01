import { PrismaClient, Book } from "@prisma/client";

const prisma = new PrismaClient();

interface BookType {
  title: string;
  publisher: string;
  yearPublished: number;
  author: string;
  isbn: string;
  qty: number;
  image: string;
  categoryId: number;
}

export const getAllBooks = async (): Promise<Book[]> => {
  const books = await prisma.book.findMany();
  return books;
};

export const getBookById = async (id: number): Promise<Book | null> => {
  const book = await prisma.book.findUnique({ where: { id } });
  return book;
};

export const insertBook = async (book: BookType): Promise<Book> => {
  return await prisma.book.create({ data: { ...book } });
};

export const updateBook = async (id: number, book: BookType): Promise<Book> => {
  return await prisma.book.update({ where: { id }, data: { ...book } });
};

export const deleteBook = async (id: number): Promise<boolean> => {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
