const { readFileSync } = require("fs");
const { resolve } = require("path");
const express = require("express");
const { Helmet } = require("react-helmet");
require("dotenv").config();

const PORT = process.env.PORT;
const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

async function createServer(root = process.cwd()) {
  const app = express();

  const indexProd = isProd ? readFileSync(resolve("dist/client/index.html"), "utf-8") : "";

  if (!isProd) {
    const vite = await require("vite").createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
    });
    app.use(vite.middlewares);
  } else {
    app.use(require("compression")());
    app.use(require("serve-static")(resolve("dist/client"), { index: false }));
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      const template = isProd
        ? indexProd
        : await vite.transformIndexHtml(url, readFileSync(resolve("index.html"), "utf-8"));

      const render = isProd
        ? require("./dist/server/entry-server.js").render
        : (await vite.ssrLoadModule("/src/entry-server.jsx")).render;

      const context = {};
      const appHtml = render(url, context);

      if (context.url) {
        return res.redirect(301, context.url);
      }

      const helmet = Helmet.renderStatic();
      const helmetTags = helmet.title.toString() + helmet.meta.toString();

      const html = template.replace("<!--app-html-->", appHtml).replace("<!--helmet-tags-->", helmetTags);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (!isProd) {
        vite.ssrFixStacktrace(e);
      }
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app };
}

async function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log("Server Running..");
      resolve(server);
    });
  });
}

if (!isTest) {
  createServer().then(({ app }) => startServer(app));
}
