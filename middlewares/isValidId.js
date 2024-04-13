import { isValidObjectId } from "mongoose";

import HttpError from "../helpers/HttpError.js";

const isValidId = (req, _, next) => {
  const { _id } = req.params;
  if (!isValidObjectId(_id)) {
    return next(HttpError(400, `${_id} is not valid id`));
  }
  next();
};

export default isValidId;
