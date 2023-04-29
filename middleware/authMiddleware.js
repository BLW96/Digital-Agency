const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token if exists & is verified
  if (token) {
    jwt.verify(token, process.env.JWT_SEC, (err, decodedToeken) => {
      if (err) {
        // console.log(err.message);
        res.redirect("/auth/login");
      } else {
        // console.log(decodedToeken);
        next();
      }
    });
  } else {
    res.redirect("/auth/login");
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SEC, async (err, decodedToeken) => {
      if (err) {
        next();
      } else {
        // console.log(decodedToeken);
        let user = await User.findById(decodedToeken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

// Admin chech
const isAdmin = (req, res, next) => {
  const user = res.locals.user;
  // console.log(user);
  if (user.isAdmin == true) {
    next();
  } else {
    req.flash("error", "Please Log in as admin");
    res.redirect("/auth/login");
  }
};

module.exports = { isAdmin, checkUser, requireAuth };
