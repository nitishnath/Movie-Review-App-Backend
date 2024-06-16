const express = require("express");
const {
  create,
  verifyEmail,
  resandEmailVerificationToken,
} = require("../controllers/user");
const { userValidator, validate } = require("../middlewares/validator");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/email-verify", verifyEmail);
router.post("/resend-email-verification-token", resandEmailVerificationToken);

module.exports = router;
