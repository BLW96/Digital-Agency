const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const { checkUser, requireAuth } = require("./middleware/authMiddleware");
require("dotenv").config({ path: "./config/.env" });

const port = process.env.PORT || 3000;

const app = express();

// setup Mongodb
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// setup Enginge
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// compress all responses
app.use(compression());

app.locals.errors = null;

// pass Projects count in home route
const Project = require("./models/Project");
// pass Category to header
const Category = require("./models/Category");

(async function () {
  const categories = await Category.find();
  try {
    app.locals.categories = categories;
  } catch (err) {
    console.log(err);
  }
})();

app.use(fileUpload());
app.use(flash());

// setup session
app.use(
  session({
    secret: process.env.SESSION_SEC,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    resave: false,
    saveUninitialized: false,
  })
);

// Setup Global errors, success flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("*", async function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// import all routes
const authRoute = require("./routes/auth");
const adminProjects = require("./routes/admin_projects");
const adminCategories = require("./routes/admin_categories");
const projectsRoute = require("./routes/projects");

app.use("*", checkUser);

// Use all Routes
app.use("/auth", authRoute);
app.use("/admin/projects", requireAuth, adminProjects);
app.use("/admin/categories", requireAuth, adminCategories);
app.use("/projects", projectsRoute);

// Admin, Home, Error Routes

app.get("/admin", requireAuth, (req, res) => {
  res.render("admin/admin_area", { title: "admin area" });
});

app.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    const featuredProjects = await Project.find({ featured: true });
    const projectCount = projects.length;

    res.render("home", {
      title: "home",
      featuredProjects,
      projectCount,
    });
  } catch (err) {
    console.log(err);
  }
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// errors stack messages
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something wrong!";
  res.status(statusCode).render("error", { err, title: "Error Page" });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log("SERVER ON PORT " + port);
  });
});
