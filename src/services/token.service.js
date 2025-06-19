const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/config");
const bcryptjs = require("bcryptjs");
const qpdf = require("node-qpdf");
const fs = require("fs");
const path = require("path");
const Recipe = require("muhammara").Recipe;
const { Blob } = require("blob");
const { PDFDocument, rgb } = require("pdf-lib");
// const userService = require('./user.service');
// const { Token } = require('../models');
const ApiError = require("../utils/ApiError");
// const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} [secret]
 * @returns {string}
 */
const generateTokenOld = (
  data,
  expiresMoment,
  type,
  secret = config.jwt.secret
) => {
  const payload = {
    data: data,
    iat: moment().unix(),
    exp: expiresMoment.unix(),
    type,
  };
  if (type == "ACCESS") {
    return jwt.sign(payload, secret);
  } else {
    return jwt.sign(payload, config.jwt.refreshSecret);
  }
};

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (data, expiresMoment, expires, type, secret) => {
  const payload = {
    data: data,
    iat: moment().unix(),
    // exp: expiresMoment.unix(),
    type,
  };
  // return jwt.sign(payload, secret);
  return jwt.sign(payload, secret, { expiresIn: expires });
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  // const tokenDoc = await Token.create({
  //   token,
  //   user: userId,
  //   expires: expires.toDate(),
  //   type,
  //   blacklisted,
  // });
  const tokenDoc = {
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  };
  return await tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  var payload = null;
  if (type == "RESET_PASSWORD") {
    try {
      payload = await jwt.verify(token, config.jwt.jwtResetKey);
      const decodedToken = { data: payload.data, blacklisted: false };
      return decodedToken;
    } catch (err) {
      // console.log("err in verifyToken", err);
      throw new Error(
        `Incorrect or expired token! Please try again. Error - ${err}`
      );
    }
  }
  // const tokenDoc = {
  //   token,
  //   type,
  //   data: payload.data,
  //   blacklisted: false,
  // };
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateTokenOld(user.id, accessTokenExpires, "ACCESS");

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateTokenOld(
    user.id,
    refreshTokenExpires,
    "REFRESH"
  );
  await saveToken(refreshToken, user.id, refreshTokenExpires, "REFRESH");

  // console.log("generateAuthTokens user >>>>>>>>", user);
  // console.log("generateAuthTokens accessToken >>>>>>>>", accessToken);
  // console.log("generateAuthTokens refreshToken >>>>>>>>", refreshToken);
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  if (!email) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expiresMoment = moment().add(
    config.jwt.resetPasswordExpirationMinutesMoment,
    "minutes"
  );
  const expires = config.jwt.resetPasswordExpirationMinutes;
  const resetPasswordToken = await generateToken(
    email,
    expiresMoment,
    expires,
    "RESET_PASSWORD",
    config.jwt.jwtResetKey
  );
  // await saveToken(resetPasswordToken, user.id, expires, "RESET_PASSWORD");
  return resetPasswordToken;
};

const hashPasswordFunction = (data) => {
  var salt = bcryptjs.genSaltSync(10);
  var hash = bcryptjs.hashSync(data, salt);
  return hash;
};

const compareHashPassword = (dataOne, dataTwo) => {
  const isMatch = bcryptjs.compareSync(dataOne, dataTwo);
  return isMatch;
};

const encryptFileFunction = (file) => {
  var options = {
    keyLength: 128,
    password: "1234",
    // restrictions: {
    //   print: "low",
    //   useAes: "y",
    // },
  };

  // var encryptedFile = qpdf.encrypt(localFilePath, options, outputFilePath);
  // var encryptedFile = qpdf.encrypt(file, options, outputFilePath);
  var encryptedFile = qpdf.encrypt(file, options);
  return encryptedFile;
};
async function convertBlobToFile(blob, filePath) {
  // Convert the blob to a Buffer
  const buffer = Buffer.from(blob, "binary");

  // Write the buffer to the specified file path
  // fs.writeFile(filePath, buffer, (err) => {

  await fs.writeFileSync(filePath, buffer, (err) => {
    if (err) {
      console.error("Error saving blob to file:", err);
    } else {
      console.log("Blob saved to file:", filePath);
    }
  });
}

const encryptPdf = async (user) => {
  const pdfDoc = new Recipe(
    path.join(`src/utils/files/${user.email}.pdf`),
    path.join(`src/utils/encryptedFiles/${user.email}.pdf`)
  );
  // const pdfDoc = new Recipe("output.pdf", "eoutput.pdf");
  // const pdfDoc = new Recipe(path.join(__dirname,"..","utils","files",`${userid}`), "eoutput.pdf");
  pdfDoc
    .encrypt({
      userPassword: `${user.email}`,
      ownerPassword: `${user.email}`,
      userProtectionFlag: 4,
    })
    .endPDF();
};

const convertFileToBlob = async (pdfFilePath) => {
  // // Read the PDF file as a buffer
  // const pdfBuffer = fs.readFileSync(pdfFilePath);

  // // Create a Blob from the PDF buffer
  // const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
  // console.log("PDF converted to Blob:", pdfBlob);
  // return pdfBlob;

  /* NEW */

  // Read the PDF file as a buffer
  const pdfBuffer = fs.readFileSync(pdfFilePath);

  // Create a "Buffer-like" object from the PDF buffer
  const pdfBlob = {
    buffer: pdfBuffer,
    type: "application/pdf",
  };
  console.log("PDF converted to Blob-like object:", pdfBlob);
  return pdfBlob;
};

async function deleteFile(filePath) {
  console.log("filePath in delete file", filePath);
  try {
    fs.unlinkSync(filePath);
    console.log("File is deleted.");
  } catch (err) {
    if (err.code === "ENOENT") {
      // The file does not exist
      console.error("The file does not exist");
    } else {
      // Some other error
      console.error(err);
    }
  }
}
module.exports = {
  generateAuthTokens,
  generateToken,
  saveToken,
  verifyToken,
  generateResetPasswordToken,
  hashPasswordFunction,
  compareHashPassword,
  encryptFileFunction,
  convertBlobToFile,
  convertFileToBlob,
  encryptPdf,
  deleteFile,
};
