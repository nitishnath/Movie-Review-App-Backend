const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateMailTransporter } = require("../utils/mail");
const { sendError } = require("../utils/helper");

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  // Check if userId is valid
  if (!isValidObjectId(userId)) sendError(res, "Invalid User");

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) return res.json({ error: "User Not Found!" });

  // Check if the user is already verified
  if (user.isVerified) return res.json({ error: "User is already verified" });

  // Find the verification token
  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return res.json({ error: "Token not found!" });

  // Compare the provided OTP with the stored token
  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return res.json({ error: "Please submit a valid OTP!" });

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
