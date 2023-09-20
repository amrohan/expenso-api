// "use strict";

// // Read the .env file.
// import * as dotenv from "dotenv";
// dotenv.config();

// // Require the framework
// import Fastify from "fastify";

// // Instantiate Fastify with some config
// const app = Fastify({
//   logger: true,
// });

// // Register your application as a normal plugin.
// app.register(import("../src/index.js"));

// export default async (req, res) => {
//   await app.ready();
//   app.server.emit("request", req, res);
// };

"use strict";

// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Import the cors module
import cors from "@fastify/cors";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register the CORS plugin
app.register(cors, {
  origin: ["http://localhost:3000", "https://piggysync-api.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Register your application as a normal plugin.
app.register(import("../src/index.js"));

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
