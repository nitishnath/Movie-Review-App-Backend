const express = require("express");
const {
  create,
  verifyEmail,
  resandEmailVerificationToken,
  forgotPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
} = require("../controllers/user");
const {
  userValidator,
  validate,
  validatePassword,
  signInValidator,
} = require("../middlewares/validator");
const { isValidPassResetToken } = require("../middlewares/user");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/sign-in", signInValidator, validate, signIn);
router.post("/email-verify", verifyEmail);
router.post("/resend-email-verification-token", resandEmailVerificationToken);
router.post("/forgot-password", forgotPassword);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);

router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPassResetToken,
  resetPassword
);

module.exports = router;
