import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import userRoute from "./routes/userRoutes";
import { getHome } from "./controllers/homeController";
import { setFlash } from "./utils/flash";
import { validateUserLogin } from "./utils/acessValidation";

const app = new Hono();

// Middleware untuk melayani file statis
app.use("/public/*", serveStatic({ root: "./" }));
// Rute contoh untuk menetapkan flash message
app.get("/set-flash", (c) => {
  setFlash(c, "This is a flash message!");
  return c.redirect("/");
});
app.get("/", validateUserLogin, getHome);
app.route("/", userRoute);

export default app;
