import express from "express";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import todayController from "../controllers/todayController.js";
import waterControler from "../controllers/waterControler.js";
import { waterSchema, waterRateSchema } from "../schemas/waterSchemas.js";
import isValidId from "../middlewares/isValidId.js";
import monthController from "../controllers/monthController.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/today", todayController.getPercentOfDailyNorm);
waterRouter.get("/month", monthController.getMonth);
waterRouter.post("/add", validateBody(waterSchema), waterControler.addWater);
waterRouter.patch(
  "/calc",
  validateBody(waterRateSchema),
  waterControler.waterRateCtrl
);
waterRouter.patch(
  "/:_id",
  isValidId,
  validateBody(waterSchema),
  waterControler.updateWater
);
waterRouter.delete("/:_id", isValidId, waterControler.deleteWater);

export default waterRouter;
