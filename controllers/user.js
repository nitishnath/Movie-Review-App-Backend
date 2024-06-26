const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const passwordResetToken = require("../models/passwordResetToken");
const { isValidObjectId } = require("mongoose");
const { generateOtp, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomBytes } = require("../utils/helper");
exports.create = async (req, res) => {
  //console.log(req.body);
  const { name, email, password } = req.body;
  const oldUser = await User.findOne({ email }); //This is a database query using the findOne method of a User model. It's trying to find a single document in the database collection that matches the provided email.
  if (oldUser) return sendError(res, "This email is already in use!");
  const newUser = new User({ name, email, password });
  await newUser.save();

  //generate 6 digit OTP
  let OTP = generateOtp();

  //storing OTP inside DataBase
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();

  //Send the OTP to the user
  var transport = generateMailTransporter();

  if (!transport || !transport.sendMail) {
    return sendError(res, "Failed to create mail transporter");
  }

  transport.sendMail({
    from: "verification@reviewpp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>Your Email Verification Token</p>
    <h1>${OTP}</h1>`,
  });

  //res.send({ user: req.body });
  // res.status(201).json({ user: req.body });
  res.status(201).json({
    message:
      "Please verify your email. OTP has been sent to your email account!",
  });
  //res.send("<h2>User Created</h2>");
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  // Check if userId is valid
  if (!isValidObjectId(userId)) return sendError(res, "Invalid User");

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User Not Found!", 404);

  // Check if the user is already verified
  if (user.isVerified) return sendError(res, "User is already verified");

  // Find the verification token
  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found!");

  // Compare the provided OTP with the stored token
  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please submit a valid OTP!");

  // Mark the user as verified
  user.isVerified = true;
  await user.save();
  await EmailVerificationToken.findByIdAndDelete(token._id);

  // Create a transport object for sending email
  const transport = generateMailTransporter();

  // Send the welcome email
  transport.sendMail({
    from: "verification@reviewpp.com",
    to: user.email,
    subject: "Welcome Email",
    html: `<h1>Welcome to our app and thanks for choosing us.</h1>`,
  });

  // Send a response indicating successful verification
  res.json({ message: "Your email is verified!" });
};

exports.resandEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User Not Found!", 404);
  if (user.isVerified) return sendError(res, "User is already verified");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(res, "You can request for another token after one hour!");

  //generate 6 digit OTP
  let OTP = generateOtp();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();

  //Send the OTP to the user
  const transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewpp.com",
    to: user.email,
    subject: "Email Verification",
    html: `<p>Your Verification OTP</p>
    <h1>${OTP}</h1>`,
  });

  res.status(201).json({
    message:
      "Please verify your email. OTP has been sent to your email account!",
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is missing!");
  const user = await User.findOne({ email });

  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await passwordResetToken.findOne({ owner: user._id });

  if (alreadyHasToken)
    sendError(res, "You can request for another token after one hour!");

  const token = await generateRandomBytes();
  const newPasswordResetToken = await passwordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  //send the link to the user email
  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewpp.com",
    to: user.email,
    subject: "Password Reset Link",
    html: `<p>Click here to reset password</p>
    <a href=${resetPasswordUrl}>Change Password Link</a>`,
  });

  res.json({ message: "Link send to your email!" });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);

  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );
  user.password = newPassword;
  await user.save();

  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewpp.com",
    to: user.email,
    subject: "Password Reset Successfully",
    html: `<h1>password Reset Successfully</h1>
    <p>Now you can use the new password</p>`,
  });

  res.json({
    message: "Password reset successfully, now you can use the new password!",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Invalid passsword");

  const { _id, name } = user;
  const jwtToken = jwt.sign({ userId: _id }, "qwertyui123456zxcvbnjhgjhgfdv");

  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
