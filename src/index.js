// Import the framework and instantiate it
import Fastify from "fastify";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  getAllBudgets,
  getAllBudgetsOfUser,
  getPerticularMonthData,
  createBudget,
  updateBudget,
  deleteBudget,
  // deleteAllBudget,
  getBudgetById,
  getCurrentMonthBudgetsOfUser,
} from "../routes/budget.routes.js";
import cors from "@fastify/cors";
import { authMiddleware } from "../helpers/middleware.js";
import { setTimeZone, getTimeZone } from "../routes/timezone.routes.js";

dotenv.config();
const connectionUrl = process.env.MONGO_URL;

const fastify = Fastify({
  logger: true,
});

mongoose
  .connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Cannot connect to the database", err);
    process.exit();
  });

await fastify.register(cors, {
  // put your options here
});

async function routes(fastify, options) {
  // Declare a route
  fastify.get("/", function (request, reply) {
    reply.header("set-timezone", "Asia/Kolkata");
    reply.send("Hello Mom");
  });

  fastify.get("/budgets/all", { preHandler: authMiddleware }, getAllBudgets);
  fastify.get(
    "/budgets/user",
    { preHandler: authMiddleware },
    getAllBudgetsOfUser
  );
  fastify.get(
    "/budgets/current-month",
    { preHandler: authMiddleware },
    getCurrentMonthBudgetsOfUser
  );
  fastify.get(
    "/budgets/month",
    { preHandler: authMiddleware },
    getPerticularMonthData
  );
  fastify.post("/budgets", { preHandler: authMiddleware }, createBudget);
  fastify.get("/budgets/:id", { preHandler: authMiddleware }, getBudgetById);
  fastify.put("/budgets/:id", { preHandler: authMiddleware }, updateBudget);
  fastify.delete("/budgets/:id", { preHandler: authMiddleware }, deleteBudget);
  // fastify.delete("/budgets/", { preHandler: authMiddleware }, deleteAllBudget);
  fastify.post("/setTimezone", { preHandler: authMiddleware }, setTimeZone);
  fastify.get("/getTimezone", { preHandler: authMiddleware }, getTimeZone);
}
export default routes;

// Run the server!
// fastify.listen(
//   { port: process.env.PORT || 3000, host: process.env.HOST || "0.0.0.0" },
//   function (err, address) {
//     if (err) {
//       fastify.log.error(err);
//       process.exit(1);
//     }
//     fastify.log.info(`server listening on ${address}`);
//   }
// );
