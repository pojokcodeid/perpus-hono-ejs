import { Hono } from "hono";
import {
  addCategory,
  editCategory,
  getCategories,
  openAddCategoryForm,
  openEditCategoryForm,
  removeCategory,
} from "../controllers/categoryController";
import { validateUserLogin } from "../utils/acessValidation";

const categoryRoute = new Hono();

categoryRoute.get("/categorys", validateUserLogin, getCategories);
categoryRoute.get("/category-add", validateUserLogin, openAddCategoryForm);
categoryRoute.post("/categorys", validateUserLogin, addCategory);
categoryRoute.get("/category/:id", validateUserLogin, openEditCategoryForm);
categoryRoute.post("/categorys-edit/:id", validateUserLogin, editCategory);
categoryRoute.get("/category-del/:id", validateUserLogin, removeCategory);

export default categoryRoute;
