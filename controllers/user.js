const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOtp, generateMailTransporter } = require("../utils/mail");
const { sendError } = require("../utils/helper");
exports.create = async (req, res) => {
  //console.log(req.body);
  const { name, email, password } = req.body;
  const oldUser = await User.findOne({ email }); //This is a database query using the findOne method of a User model. It's trying to find a single document in the database collection that matches the provided email.
  if (oldUser) sendError(res, 401, "This email is already in use!");
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
  if (!isValidObjectId(userId)) sendError(res, "Invalid User");

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) sendError(res, "User Not Found!");

  // Check if the user is already verified
  if (user.isVerified) sendError(res, "User is already verified");

  // Find the verification token
  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) sendError(res, "Token not found!");

  // Compare the provided OTP with the stored token
  const isMatched = await token.compareToken(OTP);
  if (!isMatched) sendError(res, "Please submit a valid OTP!");

  // Mark the user as verified
  user.isVerified = true;
  await user.save();
  await EmailVerificationToken.findByIdAndDelete(token._id);

  // Create a transport object for sending email
  var transport = generateMailTransporter();

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
  if (!user) sendError(res, 404, "User Not Found!");
  if (user.isVerified) sendError(res, "User is already verified");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    sendError(res, "You can request for another token after one hour!");

  //generate 6 digit OTP
  let OTP = generateOtp();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();

  //Send the OTP to the user
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewpp.com",
    to: user.email,
    subject: "Email Verification",
    html: `<p>Your Email Verification Token</p>
    <h1>${OTP}</h1>`,
  });

  res.status(201).json({
    message:
      "Please verify your email. OTP has been sent to your email account!",
  });
};
