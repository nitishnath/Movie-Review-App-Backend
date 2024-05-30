const nodemailer = require("nodemailer");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
exports.create = async (req, res) => {
  //console.log(req.body);
  const { name, email, password } = req.body;
  const oldUser = await User.findOne({ email }); //This is a database query using the findOne method of a User model. It's trying to find a single document in the database collection that matches the provided email.
  if (oldUser)
    return res.status(401).json({ error: "This email is already in use!" });
  const newUser = new User({ name, email, password });
  await newUser.save();

  //generate 6 digit OTP
  let OTP = "";
  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();

  //Send the OTP to the user
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "04a8826f0c60a6",
      pass: "a5de2911505e5c",
    },
  });

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
  if (!isValidObjectId(userId)) return res.json({ error: "Invalid User" });
  const user = await User.findById(userId);
  if (!user) return res.json({ error: "User Not Found!" });
  if (user.isVerified) res.json({ error: "User is already verified" });

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return res.json({ error: "Token not found!" });
};
