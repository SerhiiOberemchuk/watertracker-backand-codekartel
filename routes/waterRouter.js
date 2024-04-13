import express from "express";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import todayController from "../controllers/todayController.js";
import waterControler from "../controllers/waterControler.js";
import { addWaterSchema, updateWaterSchema } from "../schemas/waterSchemas.js";
import isValidId from "../middlewares/isValidId.js";


const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/today", todayController.getToday);
waterRouter.post("/add", validateBody(addWaterSchema), waterControler.addWater);
waterRouter.patch(
  "/:id/update",
  isValidId,
  validateBody(updateWaterSchema),
  waterControler.updateWater
);
waterRouter.patch("/calc", authenticate, waterControler.waterRateCtrl)
waterRouter.delete("/:id/delete", isValidId, waterControler.deleteWater);

export default waterRouter;
