import mongoose from "mongoose";

const careerAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    interest: {
      type: String,
      required: true
    },

    experience: {
      type: String,
      required: true
    },

    skills: {
      type: [String],
      default: []
    },

    workStyle: {
      type: String,
      required: true
    },

    goal: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "CareerAssessment",
  careerAssessmentSchema
);