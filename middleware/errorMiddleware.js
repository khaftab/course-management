const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.render("error/500", { message: err.message, statusCode });
  // res.json({
  //   message: err.message,
  // })
};

module.exports = {
  errorHandler,
};
