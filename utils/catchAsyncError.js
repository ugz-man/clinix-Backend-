module.exports = function catchAsync(func) {
  return async function (req, res, next) {
    func(req, res, next).catch((error) => next(error));
  };
};
