import { Context } from "hono";
import { getFlash, setFlash } from "../utils/flash";
import {
  deleteBook,
  getAllBooks,
  getBookById,
  insertBook,
  updateBook,
} from "../models/bookModel";
import { setTemplate } from "../utils/template";
import { logger } from "../utils/logger";
import { getAllCategories } from "../models/categoryModel";
import { validateBook } from "../validations/bookValidation";
import { ZodError } from "zod";
import { existsSync, createWriteStream, unlinkSync } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { acessFile } from "../utils/acessValidation";

export const getBooks = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    let msg = undefined;
    let type = "danger";
    if (getFlash(c)) {
      const out = JSON.parse((getFlash(c)?.toString() || "") as string);
      msg = out.message;
      type = out.type;
    }
    const books = await getAllBooks();
    const html = await setTemplate(c, "book/list", {
      title: "Book List",
      message: msg,
      type,
      data: books,
    });
    return c.html(html);
  } catch (error: unknown) {
    logger.error("controller/bookController/getBooks: " + error);
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/");
  }
};

export const openAddBookForm = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let msg = undefined;
  let dta = {
    title: "",
    author: "",
    categoryId: 0,
    publisher: "",
    yearPublished: 0,
    isbn: "",
    qty: 0,
    image: "",
  };
  const categorys = await getAllCategories();
  if (getFlash(c)) {
    const out = JSON.parse((getFlash(c)?.toString() || "") as string);
    msg = out.message;
    dta = out.data;
  }
  const html = await setTemplate(c, "book/add", {
    title: "Book Add",
    message: msg,
    data: dta,
    categorys,
  });
  return c.html(html);
};

export const createBook = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  const data = await c.req.parseBody();
  try {
    let fullurl = "";
    const uploadDir = path.join(process.cwd(), "public/img");
    if (!existsSync(uploadDir)) {
      mkdir(uploadDir, { recursive: true });
    }
    if (data.image instanceof File && data.image.name) {
      const files = data.image;
      const file = await files.arrayBuffer();
      const buffer = Buffer.from(file);
      const hash = createHash("md5").update(files.name).digest("hex");
      const ext = path.extname(files.name);
      const fileName = `${hash}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const fileStream = createWriteStream(filePath);
      fileStream.write(buffer);
      fileStream.end();
      const url = new URL(c.req.url);
      const protocol = url.protocol;
      const host = c.req.header("host");
      fullurl = `${protocol}//${host}/public/img/${fileName}`;
    }
    const out = await validateBook.parse(data);
    const book = await insertBook({
      title: out.title,
      author: out.author,
      categoryId: Number(out.categoryId),
      publisher: out.publisher,
      yearPublished: Number(out.yearPublished),
      isbn: out.isbn,
      qty: Number(out.qty),
      image: fullurl,
    });
    setFlash(c, "Book added successfully", "success", { data: book });
    return c.redirect("/books");
  } catch (error: unknown) {
    logger.error("controller/bookController/createBook: " + error);
    if (error instanceof Error) {
      let message = error.message;
      if (error instanceof ZodError) {
        message = JSON.parse(error.message)[0].message; // ZodError
      }
      setFlash(c, message, "danger", { data: data });
      return c.redirect("/book-add");
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data: data,
      });
      return c.redirect("/book-add");
    }
  }
};

export const openEditBook = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    let msg;
    const { id } = c.req.param();
    let dta = await getBookById(Number(id));
    const categorys = await getAllCategories();
    if (getFlash(c)) {
      const out = JSON.parse((getFlash(c)?.toString() || "") as string);
      msg = out.message;
      dta = { ...out.data, id };
    }
    const html = await setTemplate(c, "book/edit", {
      title: "Edit Book",
      message: msg,
      data: dta,
      categorys,
    });
    return c.html(html);
  } catch (error: unknown) {
    logger.error("controller/bookController/openEditBook: " + error);
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/books");
  }
};

export const setUpdateBook = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  const { id } = c.req.param();
  const data = await c.req.parseBody();
  try {
    const oldImage = data.oldImage.toString();
    const oldname = oldImage.split("/").pop();
    let fullurl = "";
    const uploadDir = path.join(process.cwd(), "public/img");
    if (!existsSync(uploadDir)) {
      mkdir(uploadDir, { recursive: true });
    }
    // jika ada file baru
    if (data.image instanceof File && data.image.name) {
      const files = data.image;
      const file = await files.arrayBuffer();
      const buffer = Buffer.from(file);
      const hash = createHash("md5").update(files.name).digest("hex");
      const ext = path.extname(files.name);
      const fileName = `${hash}${ext}`;
      // hapus file lama jika ada
      if (oldImage != "") {
        if (
          oldname !== undefined &&
          existsSync(path.join(uploadDir, oldname))
        ) {
          unlinkSync(path.join(uploadDir, oldname));
        }
      }
      // simpan file baru
      const filePath = path.join(uploadDir, fileName);
      const fileStream = createWriteStream(filePath);
      fileStream.write(buffer);
      fileStream.end();
      const url = new URL(c.req.url);
      const protocol = url.protocol;
      const host = c.req.header("host");
      fullurl = `${protocol}//${host}/public/img/${fileName}`;
    } else {
      fullurl = oldImage;
    }
    const out = await validateBook.parse(data);
    const book = await updateBook(Number(id), {
      title: out.title,
      author: out.author,
      categoryId: Number(out.categoryId),
      publisher: out.publisher,
      yearPublished: Number(out.yearPublished),
      isbn: out.isbn,
      qty: Number(out.qty),
      image: fullurl,
    });
    setFlash(c, "Book updated successfully", "success", { data: book });
    return c.redirect("/books");
  } catch (error: unknown) {
    logger.error("controller/bookController/createBook: " + error);
    console.log(error);
    if (error instanceof Error) {
      let message = error.message;
      if (error instanceof ZodError) {
        message = JSON.parse(error.message)[0].message; // ZodError
      }
      setFlash(c, message, "danger", { data: data });
      return c.redirect(`/books/${id}`);
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data: data,
      });
      return c.redirect(`/books/${id}`);
    }
  }
};

export const removeBook = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    const { id } = c.req.param();
    const book = await deleteBook(Number(id));
    setFlash(c, "Book deleted successfully", "success", { data: book });
    return c.redirect("/books");
  } catch (error: unknown) {
    logger.error("controller/bookController/deleteBook: " + error);
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/books");
  }
};
