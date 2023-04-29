const express = require("express");
const router = express.Router({ mergeParams: true });
const fs = require("fs-extra");

const catchAsync = require("../utils/catchAsync");

// get model
const Project = require("../models/Project");

/*
 * Get all projects
 */

router.get(
  "/",
  catchAsync(async (req, res) => {
    const category = req.query.category;

    // If a category is selected, fetch the projects and sort them by category
    if (category) {
      const projects = await Project.find({ category }).sort({ category: 1 });
      try {
        return res.json(projects);
      } catch (err) {
        console.log(err);
      }
    }

    // If no category is selected, render the `projects/all_projects` template with all projects sorted by category
    const projects = await Project.find().sort({ category: 1 });
    try {
      res.render("projects/all_projects", { projects, title: "ALl Projects" });
    } catch (err) {
      console.log(err);
    }
  })
);

/*
 * GET single Project
 */

router.get("/:project", async (req, res) => {
  let galleryImages = null;

  const project = await Project.findOne({ slug: req.params.project });
  try {
    const galleryDir = "public/projects_images/" + project._id + "/gallery";
    fs.readdir(galleryDir, function (err, files) {
      if (err) {
        console.log(err);
      } else {
        galleryImages = files;
        res.render("projects/project", {
          title: project.title,
          project: project,
          galleryImages: galleryImages,
        });
      }
    });
  } catch (err) {
    console.log(
      "error in router.get(/:category/:project) in project.js " + err
    );
  }
});

module.exports = router;
