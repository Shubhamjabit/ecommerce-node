const express = require("express");
const xss = require("xss-clean");
const compression = require("compression");
const passport = require("passport");
const httpStatus = require("http-status");
const config = require("./src/config/config");
const { jwtStrategy } = require("./src/config/passport");
const cors = require("cors");
const routes = require("./src/routes");
const ApiError = require("./src/utils/ApiError");
const fileupload = require("express-fileupload");

const app = express();
app.use(fileupload());

app.use(express.static("public"));
app.use("/productimages", express.static("public"));
app.use("/bannerimages", express.static("public"));
app.use("/categoryimages", express.static("public"));
// parse json request body
const bodyParserJSON = express.json();
app.use(bodyParserJSON);

// parse urlencoded request body
const bodyParserURLEncoded = express.urlencoded({ extended: true });
app.use(bodyParserURLEncoded);

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// // to see headers in api
const corsOptions = {
  exposedHeaders: "Authorization",
  // origin: [
  //   "https://sparkywarehouse.com.au/*",
  //   "https://cms.sparkywarehouse.com.au/*",
  //   "http://localhost:3000/",
  // ],
};
// // enable cors
app.use(cors(corsOptions));

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// use express router
app.use("/", routes);

// Error handling
app.use(function (req, res, next) {
  console.log(" in error handling server :", req.body);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization"
  );
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.listen(config.port, () =>
  console.log(`Listening on port ${config.port}..`)
);
