export const handleSaveError = (error, data, next) => {
  error.status =
    error.name === "MongoServerError" && error.code === 11000 ? 409 : 400;
  next();
};

export const setUpdateSettings = function (next) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
