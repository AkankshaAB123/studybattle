const mongoose = require("mongoose");

const studySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  hours: {
    type: Number,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Study", studySchema);