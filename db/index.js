const mongoose = require("mongoose");

mongoose
  .connect("mongodb://0.0.0.0:27017/review_app")
  .then(() => {
    console.log("DB is successfully connected!!");
  })
  .catch((ex) => {
    console.log("DB connection is failed", ex);
  });
