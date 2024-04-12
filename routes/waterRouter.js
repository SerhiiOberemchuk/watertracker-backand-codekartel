import express from "express";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import  waterControler from "../controllers/waterControler.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/today", waterControler.getToday);


export default waterRouter;
