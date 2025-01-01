import { Context } from "hono";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  verifyUser,
} from "../models/userModel";
import { logger } from "../utils/logger";
import {
  loginValidation,
  validateNoPasswordUser,
  validateUser,
} from "../validations/userValidation";
import { setTemplate } from "../utils/template";
import { getFlash, setFlash } from "../utils/flash";
import { acessFile, setLoginCookie } from "../utils/acessValidation";
import { deleteCookie } from "hono/cookie";

// Mendapatkan semua pengguna
export const getUsers = async (c: Context) => {
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
    const users = await getAllUsers();
    const html = await setTemplate(c, "user/list", {
      title: "User List",
      message: msg,
      type,
      data: users,
    });
    return c.html(html);
  } catch (error: unknown) {
    logger.error("controller/userController/getUsers: " + error);
    setFlash(c, "Something went wrong, please contact support");
    return c.redirect("/");
  }
};

export const openAddUserForm = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let msg, dta;
  if (getFlash(c)) {
    const out = JSON.parse((getFlash(c)?.toString() || "") as string);
    msg = out.message;
    dta = out.data;
  }
  const html = await setTemplate(c, "user/add", {
    title: "User Add",
    message: msg,
    data: dta,
  });
  return c.html(html);
};

// Mendapatkan pengguna berdasarkan ID
export const getUser = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    const { id } = c.req.param();
    let user = await getUserById(Number(id));
    if (user) {
      let msg;
      if (getFlash(c)) {
        const out = JSON.parse((getFlash(c)?.toString() || "") as string);
        msg = out.message;
        user = { ...out.data, id: user.id };
      }
      const html = await setTemplate(c, "user/edit", {
        title: "User Edit",
        message: msg,
        data: user,
      });
      return c.html(html);
    }
    setFlash(c, "User not found", "danger", { data: null });
    return c.redirect("/users");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("controller/userController/getUser: " + error);
      setFlash(c, error.message, "danger", { data: null });
      return c.redirect("/users");
    } else {
      logger.error("An unknown error occurred: " + error);
      setFlash(c, "An unknown error occurred", "danger", { data: null });
      return c.redirect("/users");
    }
  }
};

// Menambahkan pengguna baru
export const addUser = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let data = {};
  try {
    data = await c.req.parseBody();
    const { name, email, password, role } = await validateUser.parse(data);
    // validasi email exists
    const user = await getUserByEmail(email);
    if (user) {
      throw new Error("Email already exists");
    }
    data = await createUser(name, email, password, role);
    setFlash(c, "User added successfully", "success", { data });
    return c.redirect("/users");
  } catch (error: unknown) {
    logger.error("controller/userController/addUser: " + error);
    if (error instanceof Error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message)[0].message;
      } catch {
        message = error.message;
      }
      setFlash(c, message, "danger", { data });
      return c.redirect("/user-add");
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data,
      });
      return c.redirect("/user-add");
    }
  }
};

// Memperbarui pengguna
export const editUser = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  let data;
  const { id } = c.req.param();
  data = await c.req.parseBody();
  try {
    if (data.password == "") {
      data = await validateNoPasswordUser.parse(data);
      data.id = Number(id);
    } else {
      data = await validateUser.parse(data);
      data.id = Number(id);
    }
    const user = await updateUser(
      Number(id),
      data.name,
      data.email,
      data.password,
      data.role
    );
    if (user) {
      setFlash(c, "User updated successfully", "success", { data: user });
      return c.redirect("/users");
    }
    setFlash(c, "User not found", "danger", { data });
    return c.redirect(`/users-edit/${id}`);
  } catch (error: unknown) {
    logger.error("controller/userController/addUser: " + error);
    if (error instanceof Error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message)[0].message;
      } catch {
        message = error.message;
      }
      setFlash(c, message, "danger", { data, id });
      return c.redirect(`/users/${id}`);
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data,
        id,
      });
      return c.redirect(`/users/${id}`);
    }
  }
};

// Menghapus pengguna
export const removeUser = async (c: Context) => {
  if (!(await acessFile(c, "ADMIN"))) {
    return c.redirect("/notallowed");
  }
  try {
    const { id } = c.req.param();
    const success = await deleteUser(Number(id));
    if (success) {
      setFlash(c, "User deleted successfully", "success", { data: null });
      return c.redirect("/users");
    }
    setFlash(c, "User not found", "danger", { data: null });
    return c.redirect("/users");
  } catch (error: unknown) {
    logger.error("controller/userController/removeUser: " + error);
    setFlash(c, "Something went wrong, please contact support", "danger", {
      data: null,
    });
    return c.redirect("/users");
  }
};

export const openLogin = async (c: Context) => {
  let msg, dta;
  if (getFlash(c)) {
    const out = JSON.parse((getFlash(c)?.toString() || "") as string);
    msg = out.message;
    dta = out.data;
  }
  const html = await setTemplate(
    c,
    "user/login",
    {
      title: "Login",
      message: msg,
      data: dta,
    },
    false
  );
  return c.html(html);
};

// Login pengguna
export const loginUser = async (c: Context) => {
  const data = await c.req.parseBody();
  try {
    const { email, password } = await loginValidation.parse(data);
    const user = await verifyUser(email, password);
    if (user) {
      setLoginCookie(c, user);
      setFlash(c, "Login successfully", "success", { data: user });
      return c.redirect("/");
    }
    setFlash(c, "Login failed", "danger", { data });
    return c.redirect("/login");
  } catch (error: unknown) {
    logger.error("controller/userController/loginUser: " + error);
    if (error instanceof Error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message)[0].message;
      } catch {
        message = error.message;
      }
      setFlash(c, message, "danger", { data });
      return c.redirect("/login");
    } else {
      setFlash(c, "Something went wrong, please contact support", "danger", {
        data,
      });
      return c.redirect("/login");
    }
  }
};

export const logoutUser = async (c: Context) => {
  deleteCookie(c, "user");
  c.redirect("/login");
};
