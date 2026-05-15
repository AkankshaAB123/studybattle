const router = require("express").Router();

const User = require("../models/User");

// LOGIN
router.post("/login", async (req, res) => {

  try {

    const { name, password } = req.body;

    console.log("LOGIN DATA:", req.body);

    // FIND USER
    const user = await User.findOne({
      name: name,
    });

    console.log("FOUND USER:", user);

    // USER NOT FOUND
    if (!user) {

      return res.status(400).json(
        "User not found"
      );
    }

    // PASSWORD CHECK
    if (user.password !== password) {

      return res.status(400).json(
        "Wrong password"
      );
    }

    // SUCCESS
    res.status(200).json({
      _id: user._id,
      name: user.name,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});

module.exports = router;