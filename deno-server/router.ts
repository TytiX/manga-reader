import { Router, send } from "https://deno.land/x/oak/mod.ts";

import { Storage } from "./storage/storage.ts";

const storage = new Storage()

const router = new Router();
router
  .get("/", async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  })
  .get("/manga", (context) => {
    context.response.body = {
      success: true,
      data: storage.getAll()
    };
  })
  .get("/manga/:id", (context) => {
    if (context.params && context.params.id) {
      const manga = storage.find(context.params.id);
      if (manga) {
        context.response.body = manga;
      } else {
        context.response.status = 404;
      }
    }
  })
  .get("/manga/:id/:source/:chapter", (context) => {
    if (context.params && context.params.id && context.params.source && context.params.chapter) {
      const chapter = storage.findChapter(context.params.id, context.params.source, Number(context.params.chapter));
      if (chapter) {
        context.response.body = chapter;
      } else {
        context.response.status = 404;
      }
    }
  })
  .get("/manga/:id/:source/:chapter/:page", (context) => {
    if (context.params && context.params.id && context.params.source && context.params.chapter && context.params.page) {
      const page = storage.findPage(context.params.id, context.params.source, Number(context.params.chapter), Number(context.params.page));
      if (page) {
        context.response.body = page;
      } else {
        context.response.status = 404;
      }
    }
  });

export default router;
