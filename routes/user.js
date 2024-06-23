const express = require("express");
const {
  create,
  verifyEmail,
  resandEmailVerificationToken,
  forgotPassword,
} = require("../controllers/user");
const { userValidator, validate } = require("../middlewares/validator");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/email-verify", verifyEmail);
router.post("/resend-email-verification-token", resandEmailVerificationToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-pass-reset-token", isValidPassResetToken);

module.exports = router;
