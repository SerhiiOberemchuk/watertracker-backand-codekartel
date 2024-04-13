import express from "express";
import authenticate from "../middlewares/authenticate.js";
import  monthController from "../controllers/monthController.js";

const monthRouter = express.Router();

monthRouter.use(authenticate);

monthRouter.get("/", monthController.getMonth);


export default monthRouter;
