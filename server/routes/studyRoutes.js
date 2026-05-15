const express = require("express");
const router = express.Router();

const Study = require("../models/Study");


// ======================
// ADD STUDY DATA
// ======================
router.post("/add", async (req, res) => {

  try {

    const newStudy = new Study(req.body);

    await newStudy.save();

    res.status(201).json("Study Data Added");

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});


// ======================
// GET ALL STUDY DATA
// ======================
router.get("/", async (req, res) => {

  try {

    const data = await Study.find();

    res.json(data);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});


// ======================
// UPDATE STUDY ENTRY
// ======================
// UPDATE STUDY ENTRY
router.put("/:id", async (req, res) => {

  try {

    const updatedStudy =
      await Study.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: "after" }
      );

    res.json(updatedStudy);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});

// ======================
// DELETE STUDY ENTRY
// ======================
router.delete("/:id", async (req, res) => {

  try {

    await Study.findByIdAndDelete(req.params.id);

    res.json("Study Entry Deleted");

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});

module.exports = router;