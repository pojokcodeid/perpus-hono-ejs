import { Context } from "hono";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../models/categoryModel";
import { setTemplate } from "../utils/template";
import { logger } from "../utils/logger";
import { getFlash, setFlash } from "../utils/flash";
import { validateCategory } from "../validations/categoryValidation";
import { acessFile } from "../utils/acessValidation";

export const getCategories = async (c: Context) => {
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
    const categories = await getAllCategories();
    const html = await setTemplate(c, "category/list", {
      title: "Category List",
      message: msg,
      type,
      data: categories,
    });
    return c.html(html);
  } catch (error: unknown) {
    logger.error("controller/categoryController/getCategories: " + error);
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/");
  }
};

export const openAddCategoryForm = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let msg, dta;
  if (getFlash(c)) {
    const out = JSON.parse((getFlash(c)?.toString() || "") as string);
    msg = out.message;
    dta = out.data;
  }
  const html = await setTemplate(c, "category/add", {
    title: "Category Add",
    message: msg,
    data: dta,
  });
  return c.html(html);
};

export const addCategory = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let data = {};
  try {
    data = await c.req.parseBody();
    const { categoryName } = await validateCategory.parse(data);
    data = await createCategory(categoryName);
    setFlash(c, "Category added successfully", "success", { data });
    return c.redirect("/categorys");
  } catch (error: unknown) {
    logger.error("controller/categoryController/addCategory: " + error);
    if (error instanceof Error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message)[0].message;
      } catch {
        message = error.message;
      }
      setFlash(c, message, "danger", { data });
      return c.redirect("/category-add");
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data,
      });
      return c.redirect("/category-add");
    }
  }
};

export const openEditCategoryForm = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    let msg;
    const { id } = c.req.param();
    let dta = await getCategoryById(Number(id));
    if (getFlash(c)) {
      const out = JSON.parse((getFlash(c)?.toString() || "") as string);
      msg = out.message;
      dta = { ...out.data, id };
    }
    const html = await setTemplate(c, "category/edit", {
      title: "Category Edit",
      message: msg,
      data: dta,
    });
    return c.html(html);
  } catch (error: unknown) {
    logger.error(
      "controller/categoryController/openEditCat.egoryForm: " + error
    );
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/categorys");
  }
};

export const editCategory = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let data;
  const { id } = c.req.param();
  try {
    data = await c.req.parseBody();
    const { categoryName } = await validateCategory.parse(data);
    data = await updateCategory(Number(id), categoryName);
    setFlash(c, "Category edited successfully", "success", { data });
    return c.redirect("/categorys");
  } catch (error: unknown) {
    logger.error("controller/categoryController/editCategory: " + error);
    if (error instanceof Error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message)[0].message;
      } catch {
        message = error.message;
      }
      setFlash(c, message, "danger", { ...data, id });
      return c.redirect(`/category/${id}`);
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        ...data,
        id,
      });
      return c.redirect(`/category/${id}`);
    }
  }
};

export const removeCategory = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    const { id } = c.req.param();
    const success = await deleteCategory(Number(id));
    if (success) {
      setFlash(c, "Category deleted successfully", "success", { data: null });
      return c.redirect("/categorys");
    }
    setFlash(c, "Category not found", "danger", { data: null });
    return c.redirect("/categorys");
  } catch (error: unknown) {
    logger.error("controller/categoryController/removeCategory: " + error);
    setFlash(c, "Something went wrong, please contact support", "danger", {
      data: null,
    });
    return c.redirect("/categorys");
  }
};
