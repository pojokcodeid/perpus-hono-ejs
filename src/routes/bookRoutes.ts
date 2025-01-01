import { Hono } from "hono";
import { validateUserLogin } from "../utils/acessValidation";
import {
  createBook,
  getBooks,
  openAddBookForm,
  openEditBook,
  removeBook,
  setUpdateBook,
} from "../controllers/bookController";

const bookRoute = new Hono();

bookRoute.get("/books", validateUserLogin, getBooks);
bookRoute.get("/book-add", validateUserLogin, openAddBookForm);
bookRoute.post("/books", validateUserLogin, createBook);
bookRoute.get("/books/:id", validateUserLogin, openEditBook);
bookRoute.post("/books-edit/:id", validateUserLogin, setUpdateBook);
bookRoute.get("/books-del/:id", validateUserLogin, removeBook);

export default bookRoute;
