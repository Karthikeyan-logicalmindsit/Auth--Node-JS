const express = require("express");
require("dotenv").config();
const connect = require("./src/db/db");
const { verifyToken } = require("./src/middleware/authMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const questionRoute = require("./src/routes/questionRouter");

const server = express();

server.use(express.json());

server.use(verifyToken);
server.use("/", authRoutes);
server.use("/", questionRoute);
 
const PORT = process.env.PORT || 9090;

server.listen(PORT, async () => {
  await connect();
  console.log(`Server Running On: http://localhost:${PORT}`);
});
