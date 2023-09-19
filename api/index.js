"use strict";

// Read the .env file.
import * as dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

app.register(cors, {
  // put your options here
});
// Register your application as a normal plugin.
// app.register(cors, import("../src/index.js"));
import("../src/index.js").then((module) => {
  // Do something with the imported module
  // For example, you can register it as a plugin
  app.register(module.default);
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
