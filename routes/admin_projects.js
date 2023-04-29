const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const catchAsync = require("../utils/catchAsync");

const { isAdmin } = require("../middleware/authMiddleware");

/*
 *  Get Projects models
 */

const Project = require("../models/Project");
const Category = require("../models/Category");

/*
 *  Get Projects index
 */

router.get(
  "/",
  isAdmin,
  catchAsync(async (req, res) => {
    const projects = await Project.find({});
    const projectsCount = projects.length;
    res.render("admin/projects", { projects, projectsCount });
  })
);

/*
 *  Get add Projects
 */
router.get(
  "/add-project",
  isAdmin,
  catchAsync(async (req, res) => {
    let projectName = "";
    let title = "";
    let desc = "";
    let projectLink = "";
    let projectMission = "";
    let projectFeatures = "";
    const categories = await Category.find();

    res.render("admin/add_project", {
      projectName: projectName,
      title: title,
      desc: desc,
      projectLink: projectLink,
      projectMission: projectMission,
      projectFeatures: projectFeatures,
      categories: categories,
    });
  })
);

/*
 * Get All Projects By Category
 */

router.get(
  "/:category",
  isAdmin,
  catchAsync(async (req, res) => {
    const categorySlug = req.params.category;

    const c = await Category.findOne({ slug: categorySlug });
    try {
      const projects = await Project.find({ category: categorySlug });

      res.render("admin/cat_projects", {
        projects,
        title: c.title,
      });
    } catch (err) {
      console.log("error in router get.(/:category) in projects " + err);
    }
  })
);

/*
 *  Post add Projects
 */
router.post(
  "/add-project",
  isAdmin,
  catchAsync(async (req, res) => {
    const {
      title,
      projectName,
      desc,
      projectLink,
      projectFeatures,
      projectMission,
      category,
    } = req.body;
    const imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    const slug = projectName.replace(/\s+/g, "-").toLowerCase();

    const project = new Project({
      projectName: projectName,
      title: title,
      desc: desc,
      projectLink: projectLink,
      projectFeatures: projectFeatures,
      projectMission: projectMission,
      slug: slug,
      image: imageFile,
      category: category,
    });

    const projectCheck = await Project.findOne({ slug: slug });

    if (projectCheck) {
      req.flash("error", "Project name exists try again");
      const categories = await Category.find();
      try {
        res.render("admin/add_project", {
          projectName: projectName,
          title: title,
          desc: desc,
          projectLink: projectLink,
          projectFeatures: projectFeatures,
          projectMission: projectMission,
          categories: categories,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      project.save();
      try {
        // Create project folder
        fs.mkdirSync("public/projects_images/" + project._id, function (err) {
          if (err) {
            return console.log("error ar first mkdir " + err);
          } else {
            console.log("dir created in first mkdir");
          }
        });

        // create project gallery folder
        fs.mkdirSync(
          "public/projects_images/" + project._id + "/gallery",
          function (err) {
            if (err) {
              return console.log("error ar 2 mkdir " + err);
            } else {
              console.log("dir created in 2 mkdir");
            }
          }
        );

        if (imageFile != "") {
          const projectImage = req.files.image;
          const path =
            "public/projects_images/" + project._id + "/" + imageFile;

          projectImage.mv(path, function (err) {
            if (err) {
              return console.log("ERROR IN PROJECT IMAGE MV" + err);
            } else {
              console.log("no error in projectImage mv");
            }
          });
        }
        req.flash("success", "Successfully added new Project");
        res.redirect("/admin/projects");
      } catch (err) {
        console.log(err);
      }
    }
  })
);

/*
 * GET Edit Project
 */

router.get(
  "/edit-project/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    const categories = await Category.find();
    try {
      const project = await Project.findById(req.params.id).exec();
      try {
        let galleryDir = "public/projects_images/" + project._id + "/gallery";
        let galleryImages = null;

        fs.readdir(galleryDir, function (err, files) {
          if (err) {
            console.log("error in fs.readdir " + err);
          } else {
            galleryImages = files;

            res.render("admin/edit_project", {
              errors: errors,
              title: project.title,
              projectName: project.projectName,
              desc: project.desc,
              projectLink: project.projectLink,
              projectFeatures: project.projectFeatures,
              projectMission: project.projectMission,
              image: project.image,
              galleryImages: galleryImages,
              categories: categories,
              category: project.category.replace(/\s+/g, "-").toLowerCase(),
              id: project._id,
            });
          }
        });
      } catch (err) {
        console.log(err);
        res.redirect("/admin/projects");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

/*
 * POST Edit Project
 */
router.post(
  "/edit-project/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    const imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    const {
      title,
      projectName,
      desc,
      projectLink,
      projectFeatures,
      projectMission,
      pimage,
      category,
    } = req.body;
    const slug = projectName.replace(/\s+/g, "-").toLowerCase();
    const id = req.params.id;

    const project = await Project.findOne({
      slug: slug,
      _id: { $ne: id },
    }).exec();
    try {
      if (project) {
        req.flash("error", "Project name is exists");
        res.redirect("/admin/projects/edit-project/" + id);
      } else {
        const p = await Project.findById(id).exec();
        try {
          p.projectName = projectName;
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          p.projectLink = projectLink;
          p.projectFeatures = projectFeatures;
          p.projectMission = projectMission;
          p.category = category;

          if (imageFile != "") {
            p.image = imageFile;
          }

          p.save();
          if (imageFile != "") {
            if (pimage != "") {
              fs.remove(
                "public/projects_images/" + id + "/" + pimage,
                function (err) {
                  if (err) console.log(err);
                }
              );
              let projectImage = req.files.image;
              let path = "public/projects_images/" + id + "/" + imageFile;
              projectImage.mv(path, function (err) {
                if (err) {
                  return console.log("error at mv in post edit project " + err);
                } else {
                  console.log("successfully uploaded");
                }
              });
            }
          }
          req.flash("success", "Project updated");
          res.redirect("/admin/projects/edit-project/" + id);
        } catch (err) {
          console.log(err);
          res.status(500).json();
        }
      }
    } catch (err) {
      console.log("error in post edit-project " + err);
      res.status(500).json();
    }
  })
);

/*
 * POST add Project Gallery
 */

router.post(
  "/project-gallery/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    const projectImage = req.files.file;
    const id = req.params.id;

    const path =
      "public/projects_images/" + id + "/gallery/" + req.files.file.name;

    projectImage.mv(path, function (err) {
      if (err) {
        return console.log("error in mv in post post project gallery " + err);
      }
    });
    res.sendStatus(200);
  })
);

/*
 * GET Delete Projects Gallery
 */

router.get(
  "/delete-image/:image",
  isAdmin,
  catchAsync(async (req, res) => {
    const originalImage =
      "public/projects_images/" + req.query.id + "/gallery/" + req.params.image;

    fs.remove(originalImage, function (err) {
      if (err) {
        console.log("error in delete projects gallery image" + err);
      } else {
        req.flash("success", "Successfully deleted");
        res.redirect("/admin/projects/edit-project/" + req.query.id);
      }
    });
  })
);

/*
 * GET Delete Projects
 */
router.get(
  "/delete-project/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    const id = req.params.id;
    const path = "public/projects_images/" + id;

    fs.remove(path, function (err) {
      if (err) {
        console.log("error in delete project " + err);
      } else {
        Project.findByIdAndDelete(id).exec();
        try {
          req.flash("success", "Project Deleted");
          res.redirect("/admin/projects");
        } catch (err) {
          console.log("error in findOneAndDelete() " + err);
        }
      }
    });
  })
);

module.exports = router;
