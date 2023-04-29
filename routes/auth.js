const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

/*
 * SINGUP USER PAGE
 */

router.get("/signup", authController.signup_get);

/*
 * LOGIN USER PAGE
 */

router.get("/login", authController.login_get);

/*
 *  POST SINGUP USER PAGE
 */

router.post("/signup", authController.signup_post);

/*
 * POST LOGIN USER PAGE
 */

router.post("/login", authController.login_post);

/*
 * GET LOGOUT USER PAGE
 */

router.get("/logout", authController.logout_get);

module.exports = router;
