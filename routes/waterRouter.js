import express from "express";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import  todayController from "../controllers/todayController.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/today", todayController.getPercentOfDailyNorm);


export default waterRouter;
