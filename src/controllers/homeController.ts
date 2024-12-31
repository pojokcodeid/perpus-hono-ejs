import { Context } from "hono";
import { setTemplate } from "../utils/template";
import { getFlash } from "../utils/flash";

export const getHome = async (c: Context) => {
  let msg, dta;
  let type = "danger";
  if (getFlash(c)) {
    const out = JSON.parse((getFlash(c)?.toString() || "") as string);
    msg = out.message;
    dta = out.data;
    type = out.type;
  }
  const html = await setTemplate("home", {
    message: msg,
    data: dta,
    type,
    title: "World from pojok code",
  });
  return c.html(html);
};
