const Question = require("../models/questionModel");

const getQuestions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // const questions = await Question.aggregate([
    //   {
    //     $group: {
    //       _id: "$topic",
    //       questions: {
    //         $push: "$$ROOT",
    //       },
    //     },
    //   },
    // ]);

    //const questions = await Question.find({},'topic');

    const { class: selectedClass, topic, subTopic } = req.query;

    const matchStage = {
      $match: {},
    };

    if (selectedClass) matchStage.$match.class = selectedClass;
    if (topic) matchStage.$match.topic = topic;
    if (subTopic) matchStage.$match.subTopic = subTopic;

    const aggregateQuery = [matchStage];

    const questions = await Question.aggregate(aggregateQuery);

    console.log("Questions retrieved successfully");
    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("Error fetching questions:", error);

    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getQuestions };
