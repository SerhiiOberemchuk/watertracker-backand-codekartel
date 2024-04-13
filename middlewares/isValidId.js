import { isValidObjectId } from "mongoose";

import HttpError from "../helpers/HttpError.js";

const isValidId = (req, _, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(HttpError(400, `${id} is not a valid id`));
  }
  next();
};

export default isValidId;
