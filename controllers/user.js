const User = require("../models/user");
exports.create = async (req, res) => {
  //console.log(req.body);
  const { name, email, password } = req.body;
  const oldUser = await User.findOne({ email }); //This is a database query using the findOne method of a User model. It's trying to find a single document in the database collection that matches the provided email.
  console.log(oldUser, "oldUser");
  if (oldUser)
    return res.status(401).json({ error: "This email is already in use!" });
  const newUser = new User({ name, email, password });
  await newUser.save();
  //res.send({ user: req.body });
  res.status(201).json({ user: req.body });
  //res.send("<h2>User Created</h2>");
};
