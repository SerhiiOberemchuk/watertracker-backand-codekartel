import express from "express";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";

const waterRouter = express.Router();

export default waterRouter;
