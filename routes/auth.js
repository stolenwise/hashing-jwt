const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const ExpressError = require("../expressError");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    if (user) {
      await User.updateLoginTimestamp(username);
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });
    }
    throw new ExpressError("Invalid username/password", 400);
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const { username } = await User.register(req.body);
    let token = jwt.sign({ username }, SECRET_KEY);
    await User.updateLoginTimestamp(username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
