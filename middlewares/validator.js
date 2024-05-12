const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("User Name is missing!"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be 8 to 16 chaacters long!"),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  //console.log(error, "error");
  if (error.length) {
    return res.json({ error: error[0].msg });
  }
};