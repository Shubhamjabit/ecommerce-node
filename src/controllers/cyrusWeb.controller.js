const httpStatus = require("http-status");
const { cyrusWeb, tokenService, cyrusCMS } = require("../services");
const ApiError = require("../utils/ApiError");
const { resetPasswordMail } = require("../utils/emailService");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const {
  generateResetPasswordToken,
  verifyToken,
  generateAuthTokens,
} = require("../services/token.service");
const categorySyncController = async (req, res) => {
  try {
    const categoryRes = await cyrusWeb.getCategory(req.body);
    const assemblySolutionsList = await cyrusWeb.getAssemblySolutionsList(
      req.body
    );
    // console.log(" cate rservice res :", categoryRes, assemblySolutionsList);
    res.status(200).send({ categoryRes, assemblySolutionsList });
  } catch (e) {}
};
const webAttribute = async (req, res) => {
  try {
    // console.log(" webAttribute CNT req.body = ", req.body);
    const { slug, level, page, pageSize, minimum_price, maximum_price } =
      req.body;
    let content;
    let proddata;
    let total = 0;
    if (slug == "brands") {
      const brandsList = await cyrusWeb.getBrandsList(req.body);
      res.status(200).send({
        data: {
          brandsList: brandsList,
        },
      });
    }
    const productdata = await cyrusWeb.getProductDetails(req.body);
    const homeCategory = await cyrusWeb.getCategory(req.body);
    const CategoryBySlug = await cyrusWeb.getCategoryBySlug(req.body);
    const brandsList = await cyrusWeb.getBrandsList(req.body);
    const catalogueDataBySlug = await cyrusWeb.getCatalogueDataBySlug(req.body);
    const assemblySolutionsList = await cyrusWeb.getAssemblySolutionsList(
      req.body
    );
    if (level == 2) {
      proddata = await cyrusWeb.getProductByCategory(req.body);
      total = await cyrusWeb.getProductByCategoryTotal(req.body);
    } else {
      content = await cyrusWeb.getContentData(req.body);
    }
    // console.log(" webAttribute controller proddata >>>>>>>>>>>", proddata);
    // console.log(" webAttribute controller proddata total >>>>>>>>>>>", total);
    if (productdata.length > 0) {
      res.status(200).send({
        data: {
          productBySlug: productdata,
          category: homeCategory,
          categorybyslug: [],
          brandsList: brandsList,
          catalogueDataBySlug: catalogueDataBySlug,
          assemblySolutionsList: assemblySolutionsList,
        },
      });
    } else {
      res.status(200).send({
        data: {
          products: proddata,
          total: total,
          content: content,
          category: homeCategory,
          categorybyslug: CategoryBySlug,
          brandsList: brandsList,
          catalogueDataBySlug: catalogueDataBySlug,
          assemblySolutionsList: assemblySolutionsList,
        },
      });
    }
  } catch (e) {
    console.log("web Attribute Data Error >>>>>>>>>>>>>>>", e);
  }
};
const HomePageData = async (req, res) => {
  try {
    const mainBanner = await cyrusWeb.getMainBanner(req.body);
    const otherBanner = await cyrusWeb.getOtherBanner(req.body);
    const homeCategory = await cyrusWeb.getCategory(req.body);
    const popularProducts = await cyrusWeb.getPopularProducts(req.body);
    const industriesList = await cyrusWeb.getIndustriesList(req.body);
    const assemblySolutionsList = await cyrusWeb.getAssemblySolutionsList(
      req.body
    );
    const preassemblesData = await cyrusWeb.getCustPreassemblesData(req.body);
    const preassemblesCableData = await cyrusWeb.getCustPreassemblesCableData(
      req.body
    );
    const categoryList = await cyrusWeb.getCategoryList(req.body);
    // console.log(' cate rservice res :', categoryRes);
    res.status(200).send({
      data: {
        mainBanner: mainBanner,
        otherBanner: otherBanner,
        Category: homeCategory,
        popularProducts: popularProducts,
        industriesList: industriesList,
        assemblySolutionsList: assemblySolutionsList,
        preassemblesData: preassemblesData,
        preassemblesCableData: preassemblesCableData,
        categoryList: categoryList,
      },
    });
  } catch (e) {
    console.log("Home Page Data Error >>>>>>>>>>>>>>>", e);
  }
};
const webContentData = async (req, res) => {
  try {
    const contentData = await cyrusWeb.getContentData(req.body);
    // console.log(' cate rservice res :', categoryRes);
    res.status(200).send(contentData);
  } catch (e) {}
};

// const subCategoryByFilter = async (req) => {
//   try {
//     const subcategoryData = await cyrusWeb.getSubCategory(req.body);
//     // console.log(' cate rservice res :', categoryRes);
//     res.status(200).send(subcategoryData);
//   } catch (e) {}
// };

const subCategoryByFilter = async (req, res) => {
  try {
    const subcategoryData = await cyrusWeb.getSubCategory(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (subcategoryData.length > 0) {
      const userObj = {
        subcategoryData,
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" subCategoryByFilter Error :", e);
    res.status(500).send([]);
  }
};

const register = async (req, res) => {
  // console.log("Get register data :::::::::::", req);
  try {
    const register = await cyrusWeb.registerSaveData(req.body);
    //console.log("Response register data :::::::::::", register);

    res.send(register);
  } catch (e) {
    console.log("Register Error :", e);
    res.status(500).send([]);
  }
};

const login = async (req, res) => {
  // console.log("Get register data :::::::::::", req);
  try {
    const user = await cyrusWeb.loginUserWithEmailAndPassword(req.body);
    console.log("Response register data :::::::::::", user);
    const resFormat = {
      data: {
        errorMessage: "",
        status: "",
        message: "",
        user: "",
      },
    };
    // console.log("user : after login :", orders.length);
    console.log("user in login CNT:", user);
    let token = await generateAuthTokens(user[0]);
    if (Array.isArray(user) && user.length > 0) {
      resFormat.data.errorMessage = "";
      resFormat.data.status = 200;
      resFormat.data.message = "User Authenticated !";
      resFormat.data.user = user;
      res
        .header(
          "Authorization",
          `Bearer ${token?.access?.token} Refresh ${token?.refresh?.token}`
        )
        .send(resFormat);
    } else {
      if (!Array.isArray(user)) {
        resFormat.data.errorMessage = user;
        resFormat.data.status = 403;
        resFormat.data.message = user;
        resFormat.data.user = [];
        res.send(resFormat);
      } else {
        resFormat.data.errorMessage = "Invalid UserName or Password";
        resFormat.data.status = 403;
        resFormat.data.message = "Invalid UserName or Password";
        resFormat.data.user = [];
        res.send(resFormat);
      }
    }
  } catch (e) {
    console.log("login Error :", e);
    res.status(500).send([]);
  }
};
const getUserDetailsFromDB = async (req, res, newToken) => {
  // console.log("Get register data :::::::::::", req);
  console.log("newToken getUserDetailsFromDB :::::::::::", newToken);
  try {
    const user = await cyrusWeb.getUserDetailsFromDB(req.body);
    console.log("Response getUserDetailsFromDB  :::::::::::", user);
    const resFormat = {
      data: {
        errorMessage: "",
        status: "",
        message: "",
        user: "",
      },
    };
    if (user.length > 0) {
      resFormat.data.errorMessage = "";
      resFormat.data.status = 200;
      resFormat.data.message = "User Authenticated !";
      resFormat.data.user = user;

      res.send(resFormat);
    } else {
      resFormat.data.errorMessage = "Invalid UserName or Password";
      resFormat.data.status = 403;
      resFormat.data.message = "Invalid UserName or Password";
      resFormat.data.user = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log("getUserDetailsFromDB Error :", e);
    res.status(500).send([]);
  }
};
const updateUserProfile = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const profile = await cyrusWeb.updateProfile(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateProfile: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const updatePassword = async (req, res) => {
  console.log(" email to reset submit:", req.body.email);
  const resetResult = await cyrusWeb.resetPasswordSubmit(
    req.body.email,
    req.body.password
  );
  console.log(
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    resetResult
  );
  if (resetResult.length === 0) {
    res
      .status(httpStatus.OK)
      .send({ status: false, msg: "Error in updating your password!" });
  }
  res.status(httpStatus.OK).send({
    status: true,
    msg: "Password reset successful. Login to your account",
  });
};

const updatePasswordFromResetLink = async (req, res) => {
  console.log(" email to reset submit:", req.body.email);
  try {
    const decodedToken = await verifyToken(req.body.token, req.body.type);
    if (decodedToken) {
      console.log("decoded token in updatePasswordFromResetLink", decodedToken);
      const resetResult = await cyrusWeb.resetPasswordSubmit(
        req.body.email,
        req.body.password
      );
      console.log(
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
        resetResult
      );
      if (resetResult.length === 0) {
        res
          .status(httpStatus.OK)
          .send({ status: false, msg: "Error in updating your password!" });
      }
      res.status(httpStatus.OK).send({
        status: true,
        msg: "Password reset successful. Login to your account",
      });
    } else {
      // throw new Error(`Incorrect or expired token! Please try again`);
      res
        .status(404)
        .send({ error: `Incorrect or expired token! Please try again` });
    }
  } catch (error) {
    console.log(" updatePasswordFromResetLink CONTROLLER Error :", error);
    res.status(500).send(null);
  }
};

const userLogout = async (req, res) => {
  // console.log(' req :',req.body.email)
  const result = await cyrusWeb.logout(req.body.email);
  return res
    .status(httpStatus.OK)
    .send({ status: true, msg: "logout success" });
};

const loginStatus = async (req, res) => {
  // console.log("Get register data :::::::::::", req);
  try {
    const user = await cyrusWeb.checkloginStatus(req.body);
    const resFormat = {
      data: {
        status: "",
        message: "",
        user: "",
      },
    };
    if (user.length > 0) {
      resFormat.data.status = 200;
      resFormat.data.message = "success";
      resFormat.data.user = user;

      res.send(resFormat);
    } else {
      resFormat.data.status = 403;
      resFormat.data.message = "failed";
      resFormat.data.user = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log("login Error :", e);
    res.status(500).send([]);
  }
};

const getProductSearch = async (req, res) => {
  const product = {
    data: [],
  };
  try {
    const data = await cyrusWeb.productSearch(req.body);
    // const total = await cyrusWeb.getProdTotal(req.body);
    const total = data.length;
    console.log("getProductSearch data", data);
    if (data.length >= 0) {
      product.data = data;
      // product.total = total[0].total;
      product.total = total;
    }
    res.send({ product });
  } catch (e) {
    res.send({ product });
  }
};

const getProducts = async (req, res) => {
  try {
    let data = await cyrusWeb.getProducts();
    // console.log(" getOrdersData CONTROLLER DATA =>", data);
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getProducts CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getCategories = async (req, res) => {
  try {
    let data = await cyrusWeb.getCategories();
    // console.log(" getOrdersData CONTROLLER DATA =>", data);
    if (data && data.length > 0) {
      res.status(200).send(data);
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getCategories CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const saveFinalOrder = async (req, res) => {
  // let orderitems = req.body.cartData;

  // console.log('Order Data::>>>>>>>>>>>>>>>', req.body)

  const orderData = {
    data: [],
    message: "Failed",
  };
  try {
    const data = await cyrusWeb.saveFinalOrder(req.body);
    console.log("Response ::::::::::::", data);
    if (data.status > 0) {
      orderData.data = [data];
      orderData.message = "Success";
    }
    res.status(httpStatus.OK).send({ orderData });
  } catch (e) {
    res.status(httpStatus.OK).send({ orderData });
  }
};

const saveCustomProductQuote = async (req, res) => {
  console.log(
    "saveCustomProductQuote CONTROLLER REQ >>>>>>>>>>>>>>>>>>>>",
    req.body
  );
  try {
    const results = await cyrusWeb.saveCustomProductQuote(
      req.body.customProductNotRegular
    );
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log("saveQuotation CONTROLLER results =>", results);
    // return;
    // if (results.affectedRows > 0) {
    //   res.status(200).send({
    //     msg: "saveCustomProductQuote successful",
    //   });
    // } else {
    //   res
    //     .status(200)
    //     .send({ msg: "saveCustomProductQuote exists! Hence,Updated!" });
    // }
    res.status(200).send({
      msg: "saveCustomProductQuote successful",
    });
  } catch (e) {
    console.log("saveQuotation CONTROLLER Error :", e);
    res.status(500).send({ error: e });
  }
};
const saveCreditPayment = async (req, res) => {
  // let orderitems = req.body.cartData;

  // console.log('Order Data::>>>>>>>>>>>>>>>', req.body)

  const orderData = {
    data: [],
    message: "Failed",
  };
  try {
    const data = await cyrusWeb.saveCreditPayment(req.body);
    console.log("Response ::::::::::::", data);
    if (data.status > 0) {
      orderData.data = [data];
      orderData.message = "Success";
    }
    res.status(httpStatus.OK).send({ orderData });
  } catch (e) {
    res.status(httpStatus.OK).send({ orderData });
  }
};

const checkEmailExist = async (req, res) => {
  console.log(" validate email called :");
  const user = await cyrusWeb.validateEmail(req.body);
  console.log(" USER AT CONTROLLER :", user);
  const userRes = {
    email: req.body.email,
    msg: "user exist",
  };

  if (user === 0) {
    userRes.email = "";
    userRes.msg = "not exist";
  }

  res.status(httpStatus.OK).send({ userRes, msg: "success" });
};

const resetPassword = async (req, res) => {
  // console.log(' email to reset :', req.body.email);

  try {
    const resetResult = await cyrusWeb.resetPassword(req.body.email);
    console.log("@@@@@@@@@@>>>>>>>>>>>>>>>>", resetResult);
    if (resetResult.length === 0) {
      res.status(httpStatus.OK).send({
        status: false,
        msg: "Email id is not registered! Please create an account.",
      });
    } else {
      const token = await generateResetPasswordToken(resetResult[0].email);
      // const token = jwt.sign(
      //   { email: resetResult[0].email },
      //   config.jwt.jwtResetKey,
      //   { expiresIn: config.jwt.resetPasswordExpirationMinutes }
      // );
      console.log("token", token);
      console.log("req.header", req.headers);
      // const CLIENT_URL = "http://" + req.headers.host;
      const CLIENT_URL = req.headers.origin;
      const resetLink = `${CLIENT_URL}/reset-password/${token}/`;
      const data = {
        email: resetResult[0].email,
        userName: `${resetResult[0].first_name} ${resetResult[0].last_name}`,
        resetLink: resetLink,
      };
      // console.log("@@@@@@@@@@>>>>>>>>>>>>>>>>", data);
      resetPasswordMail(data);
      res.status(httpStatus.OK).send({
        status: true,
        msg: "Reset link sent to your registered email !",
      });
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const uploadCreditMemberForm = async (req, res) => {
  console.log(
    "uploadCreditMemberForm!!!!!!!!!!!!!!!1111111111111111",
    req.body
  );
  try {
    const result = cyrusWeb.uploadCreditMemberForm(req);
    if (result) {
      res.status(httpStatus.OK).send({
        msg: "File uploaded!",
      });
    }
  } catch (error) {
    console.log(" uploadCreditMemberForm Error :", e);
    res.status(500).send([]);
  }

  // setTimeout(() => {
  //   console.log("file uploaded");
  //   return res.status(200).json({ result: true, msg: "file uploaded" });
  // }, 3000);
};

const deleteUploadCreditMemberForm = async (req, res) => {
  try {
    const result = await cyrusCMS.deleteUploadImage(req);
    console.log("deleteUploadCreditMemberForm CNT result =", result);
    if (result) {
      res.status(200).send({
        data: result,
      });
    }
  } catch (error) {
    console.log("ERROR IN deleteUploadCreditMemberForm", error);
    res
      .status(500)
      .send({ message: `Error in deleteUploadCreditMemberForm ${error}` });
  }
};

const getCreditFormsList = async (req, res) => {
  console.log(
    " getCreditFormsList CONTROLLER DATA >>>>>>>>>>>>>>>>>>>>",
    req.body
  );
  try {
    const data = await cyrusWeb.getCreditFormsList(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getCreditFormsList CONTROLLER DATA =>", data);
    // return;
    if (data.length > 0) {
      res.status(200).send({ data: data, total: data[0].total });
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getCreditFormsList CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getBrandsList = async (req, res) => {
  console.log(" getBrandsList CONTROLLER DATA >>>>>>>>>>>>>>>>>>>>", req.body);
  try {
    const data = await cyrusWeb.getBrandsList(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getBrandsList CONTROLLER DATA =>", data);
    // return;
    if (data.length > 0) {
      res.status(200).send({ data: data, total: data[0].total });
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getBrandsList CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getCataloguesList = async (req, res) => {
  console.log(
    " getCataloguesList CONTROLLER DATA >>>>>>>>>>>>>>>>>>>>",
    req.body
  );
  try {
    const data = await cyrusWeb.getCataloguesList(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getCataloguesList CONTROLLER DATA =>", data);
    // return;
    if (data.length > 0) {
      res.status(200).send({ data: data, total: data[0].total });
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getCataloguesList CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getPreassemblesCategory = async (req, res) => {
  console.log(
    " getPreassemblesCategory CONTROLLER DATA >>>>>>>>>>>>>>>>>>>>",
    req.body
  );
  try {
    const data = await cyrusWeb.getPreassemblesCategory(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getPreassemblesCategory CONTROLLER DATA =>", data);
    // return;
    if (data.length > 0) {
      res.status(200).send({ data: data, total: data[0].total });
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getPreassemblesCategory CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getCustPreassemblesData = async (req, res) => {
  console.log(
    " getCustPreassemblesData CONTROLLER DATA >>>>>>>>>>>>>>>>>>>>",
    req.body
  );
  try {
    const data = await cyrusWeb.getCustPreassemblesData(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getCustPreassemblesData CONTROLLER DATA =>", data);
    // return;
    if (data.length > 0) {
      res.status(200).send({ data: data, total: data[0].total });
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getCustPreassemblesData CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const saveQuotation = async (req, res) => {
  console.log("saveQuotation CONTROLLER REQ >>>>>>>>>>>>>>>>>>>>", req.body);
  try {
    const results = await cyrusWeb.saveQuotation(req.body);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log("saveQuotation CONTROLLER results =>", results);
    // return;
    if (results.affectedRows > 0) {
      res.status(200).send({
        msg: "saveQuotation successful",
      });
    } else {
      res.status(200).send({ msg: "saveQuotation exists! Hence,Updated!" });
    }
  } catch (e) {
    console.log("saveQuotation CONTROLLER Error :", e);
    res.status(500).send({ error: e });
  }
};

const getShippingCharges = async (req, res) => {
  try {
    console.log("getShippingCharges CONTROLLER req.body = ", req.body);
    const data = await cyrusWeb.getShippingCharges(req, res);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" getShippingCharges CONTROLLER DATA =>", data);
    // return;
    // if (data.length > 0) {
    //   res.status(200).send({ data: data, msg: "getShippingCharges ok" });
    // } else {
    //   // console.log("else");
    //   res.status(204).send({ data: data, msg: "getShippingCharges Empty" });
    // }
  } catch (e) {
    console.log(" getShippingCharges CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const eFormObject = async (req, res) => {
  // let orderitems = req.body.cartData;

  // console.log("eFormObject >>>>>>>>>>>>>>>", req.body);

  // const orderData = {
  //   data: [],
  //   message: "Failed",
  // };
  try {
    const data = await cyrusWeb.eFormObject(req.body);
    console.log("eFormObject data ::::::::::::", data);
    // if (data.status > 0) {
    //   orderData.data = [data];
    //   orderData.message = "Success";
    // }
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    console.log(" eFormObject CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getProductFilters = async (req, res) => {
  try {
    console.log("getProductFilters CONTROLLER req.body = ", req.body);
    const data = await cyrusWeb.getProductFilters(req.body, res);
    console.log(" getProductFilters CONTROLLER DATA =>", data);
    // remove duplicates in filter_values
    data.map((d) => {
      d.filter_values = [...new Set(d.filter_values)];
    });
    // console.log("^^^^^^^^data", data);
    if (data.length > 0) {
      res.status(200).send({ data: data, msg: "getProductFilters ok" });
    } else {
      // console.log("else");
      res.status(204).send({ data: data, msg: "getProductFilters Empty" });
    }
  } catch (e) {
    console.log(" getProductFilters CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getWishlist = async (req, res) => {
  try {
    const data = await cyrusWeb.getMyWishlist(req);
    console.log("data from getWishlist", data);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log("Wishlist fetch error:", error);
  }
};

const handleWishlist = async (req, res) => {
  try {
    const { type } = req.query;
    const data = await cyrusWeb.handleWishlist(req.body, type);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log("Wishlist fetch error:", error);
  }
};
const getProductsByFilters = async (req, res) => {
  try {
    console.log("getProductFilters CONTROLLER req.body = ", req.body);
    // const data = await cyrusWeb.getProductDetails(req.body, res);
    console.log(" getProductFilters CONTROLLER DATA =>", data);
    // remove duplicates in filter_values
    data.map((d) => {
      d.filter_values = [...new Set(d.filter_values)];
    });
    // console.log("^^^^^^^^data", data);
    if (data.length > 0) {
      res.status(200).send({ data: data, msg: "getProductFilters ok" });
    } else {
      // console.log("else");
      res.status(204).send({ data: data, msg: "getProductFilters Empty" });
    }
  } catch (e) {
    console.log(" getProductFilters CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const getMyOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await cyrusWeb.getMyOrders(req);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log("Wishlist fetch error:", error);
    res.status(500).send(null);
  }
};
const verifyTokens = async (req, res) => {
  console.log(" verifyTokens called :", req.body);
  try {
    const decodedToken = await verifyToken(req.body.token, req.body.type);
    console.log("decodedToken", decodedToken);
    res.status(httpStatus.OK).send({ decodedToken, msg: "success" });
  } catch (error) {
    console.log(" verifyTokens CONTROLLER Error :", error);
    res.status(500).send(null);
  }
  // const decodedToken = await verifyToken(req.body.token, req.body.type);
  // console.log("decodedToken", decodedToken);

  // res.status(httpStatus.OK).send({ ...decodedToken, msg: "success" });
};

const chargeRequest = async (req, res) => {
  try {
    console.log("chargeRequest CONTROLLER req.body = ", req.body);
    const data = await cyrusWeb.chargeRequest(req, res);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log(" chargeRequest CONTROLLER DATA =>", data);
    // return;
    // if (data.length > 0) {
    //   res.status(200).send({ data: data, msg: "getShippingCharges ok" });
    // } else {
    //   // console.log("else");
    //   res.status(204).send({ data: data, msg: "getShippingCharges Empty" });
    // }
  } catch (e) {
    console.log(" getShippingCharges CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const sendEnquiry = async (req, res) => {
  try {
    const data = await cyrusWeb.sendEnquiry(req.body, res);
    // const count = await cyrusCMS.getCreditFormsList(req.body);
    console.log("sendEnquiry CONTROLLER DATA =>", data);
    // return;
    // if (data.length > 0) {
    //   res.status(200).send({ data: data, msg: "getShippingCharges ok" });
    // } else {
    //   // console.log("else");
    //   res.status(204).send({ data: data, msg: "getShippingCharges Empty" });
    // }
    res.status(200).send(data);
  } catch (e) {
    console.log("sendEnquiry CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

module.exports = {
  categorySyncController,
  webAttribute,
  HomePageData,
  webContentData,
  subCategoryByFilter,
  register,
  login,
  getUserDetailsFromDB,
  updateUserProfile,
  updatePassword,
  updatePasswordFromResetLink,
  userLogout,
  loginStatus,
  getProductSearch,
  getProducts,
  getCategories,
  saveFinalOrder,
  checkEmailExist,
  resetPassword,
  uploadCreditMemberForm,
  deleteUploadCreditMemberForm,
  getCreditFormsList,
  getBrandsList,
  getCataloguesList,
  getPreassemblesCategory,
  getCustPreassemblesData,
  saveQuotation,
  getShippingCharges,
  saveCreditPayment,
  eFormObject,
  getWishlist,
  handleWishlist,
  getMyOrders,
  getProductFilters,
  getProductsByFilters,
  verifyTokens,
  chargeRequest,
  sendEnquiry,
  saveCustomProductQuote,
};
