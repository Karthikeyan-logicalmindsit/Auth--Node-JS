const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema(
  {
    pattern: {
      type: String,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
    answerType: {
      type: Object,
      required: true,
    },
    correctAnswer: {
      type: [String],
      required: true,
    },
    explanation: {
      type: Object,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    subTopic: {
      type: String,
      required: true,
    },
  },
  {
    Timestamp: true,
  }
);
module.exports = mongoose.model("questions", questionSchema);
