import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import User from "../models/User.js";

const { ACCESS_JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401, "Not authorized"));
  }

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401, "Bearer not found"));
  }

  try {
    const { id } = jwt.verify(token, ACCESS_JWT_SECRET);
    const user = await User.findById(id);

    if (!user || !user.accessToken || user.accessToken !== token) {
      next(HttpError(401, "Not authorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
};

export default authenticate;
