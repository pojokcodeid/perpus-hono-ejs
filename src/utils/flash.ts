import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

// Helper untuk Flash Message
export const setFlash = (
  c: Context,
  message: string,
  type: string = "danger",
  obj: object = {}
) => {
  setCookie(c, "flash", JSON.stringify({ message, type, ...obj }), {
    path: "/",
    httpOnly: true, // Keamanan tambahan
    maxAge: 10, // Flash message berlaku selama 10 detik
  });
};

export const getFlash = (c: Context) => {
  const message = getCookie(c, "flash");
  if (message) {
    setCookie(c, "flash", "", { path: "/", maxAge: 0 }); // Hapus cookie setelah digunakan
  }
  return message;
};
