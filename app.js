const express = require("express");
require("./db");
const userRouter = require("./routes/user");

const app = express();
app.use(express.json()); //configures the Express application to parse incoming requests with JSON payloads
app.use("/api/user", userRouter); // '/api' will add in front of any API
// app.get("/", (req, res) => {
//   res.send("<h3>I'm from your backend server!!</h3>");
// });

// app.get("/about", (req, res) => {
//   res.send("<h3>I'm from your BE server to describe you about</h3>");
// });

app.post(
  "/sign-in",
  (req, res, next) => {
    const { email, password } = req.body;
    if (!email && !password) {
      res.json({ error: "Email and Password are Required!" });
    } else if (!password) {
      res.json({ error: "Password is Required!" });
    } else if (!email) {
      res.json({ error: "Email is Required!" });
    }
    next();
  },
  (req, res) => {
    res.send("<h1>From BE Sign-In Validation</h1>");
  }
);

app.listen(8000, () => {
  console.log("This port is listeting to 8000");
});
