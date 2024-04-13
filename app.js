import express from "express";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

import authRouter from "./routes/authRouter.js";
import waterRouter from "./routes/waterRouter.js";
import monthRouter from "./routes/monthRouter.js";
import { getSwaggerData } from "./services/getSwaggerData.js";

const { PORT = 3000, DB_HOST } = process.env;

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

const startServer = async () => {
  try {
    await mongoose.connect(DB_HOST);
    console.log("Database connection successful");

    const swaggerDocument = await getSwaggerData();
    await mongoose.connect(DB_HOST);
    console.log("Database connection successful");

    app.use("/users", authRouter);
    app.use("/water", waterRouter);
    app.use("/month", monthRouter);

    app.use("/users", authRouter);
    app.use("/water", waterRouter);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use((_, res) => {
      res.status(404).json({ message: "Route not found" });
    });
    app.use((_, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    app.use((err, req, res, next) => {
      const { status = 500, message = "Server error" } = err;
      res.status(status).json({ message });
      next();
    });
    app.use((err, req, res, next) => {
      const { status = 500, message = "Server error" } = err;
      res.status(status).json({ message });
      next();
    });

    app.listen(PORT, () => {
      console.log(`Server runing on ${PORT}`);
    });
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Connection error", error);
    console.error("Connection error", error);

    process.exit(1);
    process.exit(1);
  }
};
startServer();
startServer();

export default app;
