const express = require("express");
const router = express.Router();
const homeRoute = require("./home.route");
const cyrusWeb = require("./cyrusWeb.route");
const cyrusCMS = require("./cyrusCMS.route");
const defaultRoutes = [
  {
    path: "/",
    route: homeRoute,
  },

  {
    path: "/cyrusWeb",
    route: cyrusWeb,
  },
  {
    path: "/cyrusCMS",
    route: cyrusCMS,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
