import { readFile } from "fs/promises";
import ejs from "ejs";

export const setTemplate = async (
  template: string,
  data: object,
  isMenu = true
) => {
  const header = "./src/views/partials/header.ejs";
  const fotter = "./src/views/partials/fotter.ejs";
  const nav = "./src/views/partials/nav.ejs";
  const templatePath = "./src/views/" + template + ".ejs";
  const headerOut = await readFile(header, "utf-8");
  const fotterOut = await readFile(fotter, "utf-8");
  const navOut = await readFile(nav, "utf-8");
  const templateOut = await readFile(templatePath, "utf-8");
  let html = ejs.render(headerOut + navOut + templateOut + fotterOut, data);
  if (!isMenu) {
    html = ejs.render(headerOut + templateOut + fotterOut, data);
  }
  return html;
};
