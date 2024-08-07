const crypto = require("crypto");

const sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};

const generateRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const buffString = buff.toString("hex");

      resolve(buffString);
    });
  });
};

const handleNotFound = (req, res) => {
  sendError(res, "Not Found!", 404);
};

module.exports = { generateRandomBytes, sendError, handleNotFound };
