import { Application } from "https://deno.land/x/oak/mod.ts";
import { Cron } from "https://deno.land/x/cron/cron.ts";

import { scanAllSite } from "./site-parser.ts";
import router from "./router.ts";

const port = 3030

const cron = new Cron();
cron.start();

// every hour
scanAllSite();
cron.add("* * */1 * *", () => {
  scanAllSite();
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port });
