const { isValidObjectId } = require("mongoose");
const { sendError } = require("../utils/helper");
const passwordResetToken = require("../models/passwordResetToken");

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (!token.trim() || !isValidObjectId(userId))
    return sendError(res, "Invalid Request!");

  const resetToken = await passwordResetToken.findOne({ owner: userId });
  if (!resetToken)
    return sendError(res, "Unauthorized assess, Invalid Request!");

  const mathched = await resetToken.compareToken(token);
  if (!mathched) return sendError(res, "Unauthorized assess, Invalid Request!");

  req.resetToken = resetToken;

  next();
};
