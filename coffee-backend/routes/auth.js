const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP BODY:", req.body);

    const {
      name,
      email,
      password,
      avatar,
    } = req.body;


    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }


    const hashed = await bcrypt.hash(password, 10);


    const user = await User.create({
      name,
      email,
      password: hashed,
      avatar: avatar || null,
    });


    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );


    res.status(201).json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });


  } catch (err) {

    console.log("SIGNUP ERROR:", err);

    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });

  }
});



// LOGIN
router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    const user = await User.findOne({
      email
    });


    if (!user) {

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }



    const match = await bcrypt.compare(
      password,
      user.password
    );


    if (!match) {

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }



    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );



    res.json({

      token,


      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        role: user.role,
      }

    });



  } catch (err) {

    res.status(500).json({
      message: "Login failed",
      error: err.message
    });

  }


});


module.exports = router;