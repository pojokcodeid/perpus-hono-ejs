import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

// set cookie if login sucess
export const setLoginCookie = (c: Context, obj: object) => {
  setCookie(c, "user", JSON.stringify({ ...obj }), {
    path: "/",
    httpOnly: true, // Keamanan tambahan
    maxAge: 86400, // Flash message berlaku selama 1 hari
  });
};

export const getLoginCookie = (c: Context) => {
  const message = getCookie(c, "user");
  return message;
};

export const getUserLoginData = (c: Context) => {
  const user = getLoginCookie(c);
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return false;
    }
  }
  return false;
};

export const validateUserLogin = async (
  c: Context,
  next: () => Promise<void>
) => {
  const user = getLoginCookie(c);
  if (user) {
    await next();
  }
  return c.redirect("/login");
};

export const acessFile = async (c: Context, role: string = "USER") => {
  const user = getLoginCookie(c);
  if (user) {
    const userObjeck = JSON.parse(user?.toString() || "");
    if (userObjeck.role != role) {
      return false;
    }
  }
  return true;
};
