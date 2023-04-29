const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Project Schema

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    desc: {
      type: String,
      trim: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    projectLink: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String,
    },
    projectMission: {
      type: String,
      trim: true,
      required: true,
    },
    projectFeatures: {
      type: String,
      trim: true,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
