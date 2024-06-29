const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB is successfully connected!!");
  })
  .catch((ex) => {
    console.log("DB connection is failed", ex);
  });
