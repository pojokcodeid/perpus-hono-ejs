import { Hono } from "hono";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
  loginUser,
  openAddUserForm,
  openLogin,
  logoutUser,
} from "../controllers/userController";
import { validateUserLogin } from "../utils/acessValidation";

const userRoute = new Hono();

userRoute.get("/users", validateUserLogin, getUsers);
userRoute.get("/user-add", validateUserLogin, openAddUserForm);
userRoute.get("/users/:id", validateUserLogin, getUser);
userRoute.post("/users", validateUserLogin, addUser);
userRoute.post("/users-edit/:id", validateUserLogin, editUser);
userRoute.get("/users-del/:id", validateUserLogin, removeUser);
userRoute.get("/login", openLogin);
userRoute.post("/login", loginUser);
userRoute.get("/logout", validateUserLogin, logoutUser);

export default userRoute;
