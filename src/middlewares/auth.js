const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { roleRights } = require("../config/roles");
const config = require("../config/config");
const { generateAuthTokens } = require("../services/token.service");
const jwt = require("jsonwebtoken");

const verifyCallback =
  (req, res, resolve, reject, requiredRights, refreshToken) =>
  async (err, user, info) => {
    if (err || info || !user) {
      // console.log("verifyCallback err>>>>>>>", err);
      // console.log("verifyCallback info>>>>>>>", info);
      // console.log("verifyCallback user>>>>>>>", user);
      if (err.name == "TokenExpiredError") {
        console.log("ACCESS token expired", err.name);
        if (!refreshToken || refreshToken == undefined) {
          // return new ApiError(
          //   httpStatus.UNAUTHORIZED,
          //   "Access Denied. No refresh token provided."
          // );
          return await reject(
            new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate")
          );
        }
        const decoded = jwt.verify(
          refreshToken,
          config.jwt.refreshSecret,
          async (error, decodedToken) => {
            if (error) {
              console.log("refresh token rejected", err.name);
              return await reject(
                new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate")
              );
            } else {
              // console.log("decoded = ", decoded);
              var newToken = await generateAuthTokens(decodedToken.data);
              console.log("newToken", newToken);
              // req.newTokens = newToken;
              await res.header(
                "Authorization",
                `Bearer ${newToken?.access?.token} Refresh ${newToken?.refresh?.token}`
              );
            }
          }
        );
      } else {
        console.log("token rejected", err.name);
        return await reject(
          new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate")
        );
      }
    }
    req.user = user;

    if (requiredRights.length) {
      const userAllowedUrl = await roleRights.get("admin");

      // console.log("URL USER ALLOWED :", userAllowedUrl);
      // console.log("Required Url :", requiredRights);
      // console.log(
      // "requiredRights ::::::: ALLOWED URL :",
      // userAllowedUrl.find((url) => url === requiredRights)
      // );

      const isAllowed = await userAllowedUrl.find(
        (url) => url === requiredRights
      );
      console.log("is allowed :", isAllowed);
      // const isAllowed = 1;
      if (isAllowed === undefined) {
        return await reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };
/*
const authOld = (requiredRights) => async (req, res, next) => {
  console.log("require rights :", requiredRights);
  console.log("req.headers in auth = :", req.headers);
  // req.headers.authorization
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject, requiredRights)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};
*/
const auth = (requiredRights) => async (req, res, next) => {
  // console.log("require rights :", requiredRights);
  // console.log("req in auth = :", req);
  // console.log("req.headers in auth = :", req.headers);
  // console.log("req.route in auth = :", req.route);
  // req.headers.authorization
  // requiredRights = req.url;
  requiredRights = req.route.path;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const refreshToken = authHeader.split(" ")[3];
    console.log("ACCESS Token >>>>>>>>>>>", token);
    console.log("refreshToken >>>>>>>>>>>", refreshToken);
    return await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        config.jwt.secret,
        verifyCallback(req, res, resolve, reject, requiredRights, refreshToken)
      );
    })
      .then(() => next())
      .catch((err) => next(err));
  } else {
    console.log("auth err NO TOKENS!!!!");
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Authenticate"));
  }
};

module.exports = auth;
