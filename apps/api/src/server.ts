import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.info(`API listening on port ${env.PORT}.`);
});

function shutdown(signal: string) {
  server.close((error) => {
    if (error) {
      console.error({ signal, code: "SERVER_SHUTDOWN_ERROR" });
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
