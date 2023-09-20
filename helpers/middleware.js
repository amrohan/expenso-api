export const authMiddleware = async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply.status(401).send({ message: "Please send a valid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  const validToken = process.env.TOKEN; // Get the valid token from the local environment
  reply.header("Access-Control-Allow-Origin", "*");

  if (token !== validToken) {
    reply.status(403).send({ message: "Invalid token" });
    return;
  }
};
