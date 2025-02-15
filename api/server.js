// See https://github.com/typicode/json-server#module
import pkg from "json-server";
const { create, router: _router, defaults, rewriter } = pkg;

const server = create();

// Uncomment to allow write operations
import { readFileSync } from "fs";
import { join } from "path";
const filePath = join("db.json");
const data = readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = _router(db);

// Comment out to allow write operations
// const router = jsonServer.router('db.json')

const middlewares = defaults();

server.use(middlewares);
// Add this before server.use(router)
server.use(
  rewriter({
    "/api/*": "/$1",
    "/blog/:resource/:id/show": "/:resource/:id",
  })
);
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});

// Export the Server API
export default server;
