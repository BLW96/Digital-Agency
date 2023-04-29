const User = require("../models/User");
const jwt = require("jsonwebtoken");

/*
 * Handle Errors function
 */

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "incorrect username") {
    errors.username = "that username is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.username = "that password is incorrect";
  }

  // validation errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// Creating Token

const maxAge = 24 * 60 * 60; // 1 day
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: maxAge,
  });
};

/*
 * GET SIGNUP PAGE ROUTE
 */

module.exports.signup_get = (req, res) => {
  res.render("auth/signup_page", { title: "Signup Page" });
};

/*
 * GET LOGIN PAGE ROUTE
 */

module.exports.login_get = (req, res) => {
  res.render("auth/login_page", { title: "Login Page" });
};

/*
 * POST CREATE USER ROUTE
 */

module.exports.signup_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.create({ username, password });
    const token = createToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

/*
 * POST LOGIN PAGE ROUTE
 */

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(200).json({ errors });
  }
};

/*
 * GET LOGOUT PAGE ROUTE
 */

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
