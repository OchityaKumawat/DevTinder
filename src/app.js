const express = require("express");

const app = express();

app.use("/login", (req, res) => {
  res.send("Welcome to the login page");
});

app.use((req, res) => {
  res.send("Hello form the server 3000!");
});

app.listen(3000, () => {
  console.log("Server running at port: ");
});
