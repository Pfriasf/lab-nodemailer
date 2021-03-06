require("dotenv").config();

const session = require("./configs/session.config");
const createError = require("http-errors");
const routes = require("./configs/routes");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const User = require("./models/User.model");

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// require database configuration
require("./configs/db.config");

// Middleware Setup
app.use(logger("dev"));
app.use(express.json());
app.use(session);
app.use(express.urlencoded({ extended: false }));

// Express View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
hbs.registerPartials(__dirname + "/views/partials");

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

//sessions
app.use((req, res, next) => {
  if (req.session.currentUserId) {
    User.findById(req.session.currentUserId).then((user) => {
      if (user) {
        req.currentUser = user;
        res.locals.currentUser = user;

        next();
      }
    });
  } else {
    next();
  }
});

app.use("/", routes);

// Error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((error, req, res, next) => {
  console.log(error);
  if (!error.status) {
    error = createError(500);
  }
  res.status(error.status);
  res.render("error", error);
});

module.exports = app;
