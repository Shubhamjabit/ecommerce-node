const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const emailService = require("../utils/emailService");
const { cyrusCMS, tokenService } = require("../services");
const ApiError = require("../utils/ApiError");
const { creditAccountMail } = require("../utils/emailService");
const { object } = require("joi");
const userLogin = async (req, res) => {
  // console.log("In Login:::::::::::::>>>>>>>>>>>>>");
  const { email, password } = req.body;
  try {
    const user = await cyrusCMS.GetLoginDetils(email, password);

    console.log("InloginData ::::::::::>>>>>>>>>>>>>", user);

    // res.status(200).send(loginData);

    if (user) {
      tokens = await tokenService.generateAuthTokens(email);
    }

    const resFormat = {
      data: {
        errorMessage: "",
        status: "",
        message: "",
        user: "",
        tokens: "",
      },
    };
    // console.log('user : after login :', user[0]);
    if (user.length > 0 && user[0].message !== "inactive") {
      // console.log('USER FROM QUERY :', user[0])
      const userObj = {
        email: email,
        email_verified: true,
        sub: user[0].id,
      };

      //  console.log(' ADDRESS LIST IS :', addressList);

      resFormat.data.errorMessage = "";
      resFormat.data.status = httpStatus.OK;
      resFormat.data.message = "User Authenticated !";
      resFormat.data.user = userObj;
      resFormat.data.tokens = tokens;

      res.send(resFormat);
    } else if (user[0].message == "inactive") {
      resFormat.data.errorMessage = "User Inactive!";
      resFormat.data.status = httpStatus.UNAUTHORIZED;
      resFormat.data.message = "User Inactive!";
      resFormat.data.user = [];
      resFormat.data.tokens = "";
      res.send(resFormat);
    } else {
      resFormat.data.errorMessage = "Invalid UserName or Password";
      resFormat.data.status = httpStatus.UNAUTHORIZED;
      resFormat.data.message = "Invalid UserName or Password";
      resFormat.data.user = [];
      resFormat.data.tokens = "";
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const getCategoryTable = async (req, res) => {
  try {
    const categorytable = await cyrusCMS.getCategoryTableData(req.body);
    const categorytableCount = await cyrusCMS.getCategoryTableCount(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (categorytable.length > 0) {
      const userObj = {
        categorytablecms: {
          data: categorytable,
          total: categorytableCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getSubCategoryTable = async (req, res) => {
  try {
    const categorytable = await cyrusCMS.getSubCategoryTableData(req.body);
    const categorytableCount = await cyrusCMS.getSubCategoryTableCount(
      req.body
    );

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (categorytable.length > 0) {
      const userObj = {
        subcategorytablecms: {
          data: categorytable,
          total: categorytableCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getSubSubCategoryTable = async (req, res) => {
  try {
    const categorytable = await cyrusCMS.getSubSubCategoryTableData(req.body);
    const categorytableCount = await cyrusCMS.getSubSubCategoryTableCount(
      req.body
    );

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (categorytable.length > 0) {
      const userObj = {
        subsubcategorytablecms: {
          data: categorytable,
          total: categorytableCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getCategorycms = async (req, res) => {
  try {
    const categorycms = await cyrusCMS.getCategorycmsData(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (categorycms.length > 0) {
      const userObj = {
        categorycms: {
          data: categorycms,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getCategoryRelatedData = async (req, res) => {
  try {
    const categorycms = await cyrusCMS.getCategoryData(req.body);
    const categoryfiltercms = await cyrusCMS.getFilterData(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (categorycms.length > 0 && categoryfiltercms.length > 0) {
      const userObj = {
        categorycms: {
          data: categorycms,
        },
        categoryfiltercms: {
          data: categoryfiltercms,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const addCategory = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.saveCategory(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const updateCategory = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.updatecategory(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const addSubSubCategory = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.saveSubSubCategory(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveSubSubCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const updateSubSubCategory = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.updatesubsubcategory(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateSubSubCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const getProductRelatedData = async (req, res) => {
  try {
    const parentCategory = await cyrusCMS.getParentCategoryListData();
    const category = await cyrusCMS.getCategoryListData();
    const similarproduct = await cyrusCMS.getSimilarProductsData();
    const alternativeproduct = await cyrusCMS.getAlternativeProductsData();
    const industries = await cyrusCMS.getIndustriesListData();
    const brands = await cyrusCMS.getBrandsListData();
    const filterNameList = await cyrusCMS.getFilterNameList();
    const sectionList = await cyrusCMS.getSectionList();
    const custCableList = await cyrusCMS.getCableList();
    const custTerminalList = await cyrusCMS.getTerminalList();
    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (
      parentCategory.length > 0 ||
      category.length > 0 ||
      similarproduct.length > 0 ||
      alternativeproduct.length > 0 ||
      industries.length > 0 ||
      brands.length > 0 ||
      filterNameList.length > 0 ||
      custCableList.length > 0 ||
      custTerminalList.length > 0
    ) {
      const userObj = {
        parentCategory: {
          data: parentCategory,
        },
        category: {
          data: category,
        },
        similarproduct: {
          data: similarproduct,
        },
        alternativeproduct: {
          data: alternativeproduct,
        },
        industries: {
          data: industries,
        },
        brands: {
          data: brands,
        },
        filterNameList: {
          data: filterNameList,
        },
        sectionList: {
          data: sectionList,
        },
        custCableList: {
          data: custCableList,
        },
        custTerminalList: {
          data: custTerminalList,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const getProductTable = async (req, res) => {
  try {
    const products = await cyrusCMS.GetProductTableData(req.body);
    const productCount = await cyrusCMS.GetProductTableCount(req.body);

    const resFormat = {
      data: [],
    };
    console.log("user : after login :", products.length);
    if (products.length > 0) {
      const userObj = {
        productslistdatacms: {
          data: products,
          total: productCount[0].total,
          // total: products.length,
        },
      };
      console.log("getProductTable response", userObj);
      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      const userObj = {
        productslistdatacms: {
          data: [],
          total: 0,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getProductDetailByID = async (req, res) => {
  try {
    const products = await cyrusCMS.GetProductDetailData(req.body);

    const resFormat = {
      data: [],
    };
    if (products.length > 0) {
      const userObj = {
        productDetail: {
          data: products,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      const userObj = {
        productDetail: {
          data: [],
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const saveProduct = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const products = await cyrusCMS.saveProductData(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (products.length > 0) {
      // const userObj = {
      //   orderscms: {
      //     data: orders,
      //     total: orderCount[0].total,
      //   },
      // };

      // resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};
const updateProduct = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const products = await cyrusCMS.updateProductData(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (products.length > 0) {
      // const userObj = {
      //   orderscms: {
      //     data: orders,
      //     total: orderCount[0].total,
      //   },
      // };

      // resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await cyrusCMS.deleteProductData(req.body);
    res.send({ deleteProductStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const addMainBanner = async (req, res) => {
  try {
    const banner = await cyrusCMS.saveMainBanner(req.body);
    console.log("!!!!!!!!!!55555555555 addMainBanner banner=", banner);
    res.send({ saveMainBanner: "success" });
  } catch (e) {
    console.log("Error in addMainBanner ", e);
    res.status(500).send([]);
  }
};
const updateMainBanner = async (req, res) => {
  try {
    const banner = await cyrusCMS.updateMainBanner(req.body);
    res.send({ updateMainBanner: "success" });
  } catch (e) {
    console.log("Error in updateMainBanner ", e);
    res.status(500).send([]);
  }
};
const getMainBannerTable = async (req, res) => {
  try {
    const bannerTable = await cyrusCMS.getMainBannerData(req.body);
    const bannerCount = await cyrusCMS.getMainBannerCount(req.body);

    const resFormat = {
      data: [],
    };
    if (bannerTable.length > 0) {
      const userObj = {
        mainbannerData: {
          data: bannerTable,
          total: bannerCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    res.status(500).send([]);
  }
};

const getBannerTable = async (req, res) => {
  try {
    const bannerTable = await cyrusCMS.getBannerData(req.body);
    const bannerCount = await cyrusCMS.getBannerCount(req.body);

    const resFormat = {
      data: [],
    };
    if (bannerTable.length > 0) {
      const userObj = {
        bannerData: {
          data: bannerTable,
          total: bannerCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    res.status(500).send([]);
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await cyrusCMS.updateBanner(req.body);
    res.send({ updateBanner: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};
const deleteBanner = async (req, res) => {
  try {
    const banner = await cyrusCMS.deleteBannerData(req.body);
    res.send({ deleteBanner: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};
const getContentTable = async (req, res) => {
  try {
    const contentTable = await cyrusCMS.getContentData(req.body);
    const contentCount = await cyrusCMS.getContentCount(req.body);

    const resFormat = {
      data: [],
    };
    if (contentTable.length > 0) {
      const userObj = {
        contentData: {
          data: contentTable,
          total: contentCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    res.status(500).send([]);
  }
};

const addContentData = async (req, res) => {
  try {
    const content = await cyrusCMS.saveContentData(req.body);
    res.send({ saveContent: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await cyrusCMS.deleteContentData(req.body);
    res.send({ deleteContent: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const updateContent = async (req, res) => {
  try {
    const content = await cyrusCMS.updateContentData(req.body);
    res.send({ updateContent: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const getFiltersAccordingToCategory = async (req, res) => {
  try {
    let data = await cyrusCMS.getFiltersAccordingToCategory(req.body);
    const categorytableCount = await cyrusCMS.getFiltersCount(req.body);
    // console.log("data=====>", data);
    // conver filter names to array
    for (let i = 0; i < data?.length; i++) {
      let a = data[i]?.filterName?.split(",");
      // console.log(a);
      data[i].filterName = a;
    }
    console.log("TOTAL IN getFiltersAccordingToCategory", categorytableCount);
    if (data.length > 0) {
      // console.log("if");
      res.send({
        data,
        // total: categorytableCount[0].total,
        total: categorytableCount,
      });
    } else {
      // console.log("else");
      res.send({
        data: [],
        // total: categorytableCount[0].total,
        total: categorytableCount,
      });
    }
  } catch (e) {
    console.log("getFiltersAccordingToCategory CONTROLLER Error", e);
    res.status(500).send([]);
  }
};
const addFilterWithCategory = async (req, res) => {
  try {
    // console.log("CONTROLLER addFilterWithCategory", req);
    const category = await cyrusCMS.addFilterWithCategory(req.body);
    res.send({ message: "success" });
  } catch (e) {
    console.log(" addFilterWithCategory CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const updateManageFilter = async (req, res) => {
  try {
    // console.log("CONTROLLER updateManageFilter", req.body);
    const category = await cyrusCMS.updateManageFilter(req.body);
    res.send({ message: "success" });
  } catch (e) {
    console.log(" addFilterWithCategory CONTROLLER Error :", e);
  }
};

const getSubCategoryTitleTable = async (req, res) => {
  try {
    let data = await cyrusCMS.getSubCategoryTitleTableData(req.body);
    let total = await cyrusCMS.getSubCategoryTitleTableCount();

    console.log("data", data);

    for (let i = 0; i < data?.length; i++) {
      let a = data[i]?.subcategory_title?.split("=");

      data[i].subcategory_title = a;
      if (data[i].filterJson[0].id == null) {
        console.log("NEED TO REMOVE THIS OBJECT", data[i].filterJson[0]);
        data[i].filterJson.pop();
      }
    }
    console.log("data", data);
    if (data.length > 0) {
      res.send({
        data,
        total,
      });
    } else {
      res.status(204).send({
        data: [],
        total: 0,
      });
    }
  } catch (e) {
    console.log("getSubCategoryTitleTable CONTROLLER Error", e);
    res.status(500).send([]);
  }
};

const updateManageSubcategoryTitle = async (req, res) => {
  try {
    // console.log("CONTROLLER updateManageFilter", req.body);
    const category = await cyrusCMS.updateManageSubcategoryTitle(req.body);
    console.log("CONTROLLER updateManageSubcategoryTitle category= ", category);
    res.send({ message: "success" });
  } catch (e) {
    console.log(" addFilterWithCategory CONTROLLER Error :", e);
  }
};

const deleteSubcategoryTitle = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteSubcategoryTitle CNT", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteSubcategoryTitle(req.body);
    console.log("delete deleteSubcategoryTitle CNT", result);
    res.status(200).send({ message: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const addSubcategoryTitle = async (req, res) => {
  try {
    const subdategorytitle = await cyrusCMS.saveSubcategoryTitle(req.body);
    res.send({ saveSubategorytitle: "success" });
  } catch (e) {
    console.log("Add Subcategory Title Error ::::::", e);
    res.status(500).send([]);
  }
};

const updateProductStockByExcel = async (req, res) => {
  try {
    // console.log("Upload Excel >>>>>>>>>", req.body);
    const stockInsertResponse = await cyrusCMS.updateProductStockByExcel(
      req.body
    );

    const resFormat = {
      data: [],
    };

    resFormat.data = stockInsertResponse;

    res.send(resFormat);
  } catch (e) {
    console.log("stock error :", e);
    res.status(500).send([]);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res get all stock log list
 */

const getStockTable = async (req, res) => {
  try {
    const stockTable = await cyrusCMS.getStockTable(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (stockTable.length > 0) {
      const userObj = {
        productStock: {
          data: stockTable,
          total: stockTable.length,
        },
      };

      resFormat.data = userObj;
      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getOrdersList = async (req, res) => {
  try {
    const data = await cyrusCMS.getOrdersList(req.body);
    const count = await cyrusCMS.getOrdersListCount(req.body);
    // console.log(" getOrdersData CONTROLLER DATA =>", data);
    const resFormat = {
      data: [],
    };
    if (data.length > 0) {
      const userObj = {
        data: data,
        total: count[0].total,
      };
      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" ordersData CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getOrderDetails = async (req, res) => {
  try {
    // console.log("getOrderDetails CONTROLLER req==============>", req.body);
    let data = await cyrusCMS.getOrderDetails(req.body);
    console.log(" getOrderDetails CONTROLLER DATA =>", data);
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getOrderDetails CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getUserTable = async (req, res) => {
  try {
    const usertable = await cyrusCMS.getUserTableData(req.body);
    const userCount = await cyrusCMS.getUserTableCount(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (usertable.length > 0) {
      const userObj = {
        usertablecms: {
          data: usertable,
          total: userCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log("get User Table Error ::::::::::", e);
    res.status(500).send([]);
  }
};

const activeUser = async (req, res) => {
  try {
    const user = await cyrusCMS.updateActiveUser(req.body);
    res.send({ activeUserStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const inactiveUser = async (req, res) => {
  try {
    const user = await cyrusCMS.updateInactiveUser(req.body);
    res.send({ inactiveUserStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const saveOrdersLogs = async (req, res) => {
  try {
    const category = await cyrusCMS.saveOrdersLogs(req.body);
    res.send({ message: "success" });
  } catch (e) {
    console.log(" saveOrdersLogs CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getOrderLogs = async (req, res) => {
  try {
    // console.log("getOrderLogs CONTROLLER req==============>", req.body);
    let data = await cyrusCMS.getOrderLogs(req.body);
    // console.log(" getOrderLogs CONTROLLER DATA =>", data);
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      // console.log("else");
      res.status(204).send(data);
    }
  } catch (e) {
    console.log(" getOrderLogs CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getexpotProductList = async (req, res) => {
  try {
    const products = await cyrusCMS.GetProductExportData(req.body);

    const resFormat = {
      data: [],
    };
    console.log("user : after login :", products.length);
    if (products.length > 0) {
      const userObj = {
        productsexpotlistdata: {
          data: products,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      const userObj = {
        productsexpotlistdata: {
          data: [],
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const updateErpNumber = async (req, res) => {
  try {
    const category = await cyrusCMS.updateErpNumber(req.body);
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log(" updateErpNumber CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getexportOrderList = async (req, res) => {
  try {
    const products = await cyrusCMS.getexportOrderList();
    const resFormat = {
      data: [],
    };
    // console.log("getexportOrderList LENGTH", products);
    if (products.length > 0) {
      const userObj = {
        productsexportlistdata: {
          data: products,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      const userObj = {
        productsexportlistdata: {
          data: [],
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    }
  } catch (e) {
    console.log(" getexportOrderList CONTROLLER ERROR :", e);
    res.status(500).send([]);
  }
};

const sendShippingEmail = async (req, res) => {
  try {
    const category = await emailService.sendShippingEmail(req.body);
    res.status(200).send({ message: "success" });
  } catch (e) {
    console.log(" sendShippingEmail CONTROLLER Error :", e);
    res.status(500).send([]);
  }
};

const getCreditMembersList = async (req, res) => {
  try {
    const result = await cyrusCMS.getCreditMembersList(req.body);
    const count = result[0].total;

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (result.length > 0) {
      const userObj = {
        usertablecms: {
          data: result,
          total: count,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.status(204).send(resFormat);
    }
  } catch (e) {
    console.log("get User Table Error ::::::::::", e);
    res.status(500).send([]);
  }
};

const UpdateStatusCreditAccount = async (req, res) => {
  try {
    const results = await cyrusCMS.UpdateStatusCreditAccount(req.body);
    creditAccountMail({
      email: results[0].email,
      userName: `${results[0].first_name} ${results[0].last_name}`,
      comment: results[0].comment,
      status: results[0].status,
      subject:
        results[0].status == "0"
          ? "Credit Membership Application is Pending Review"
          : results[0].status == "1"
          ? "Your Credit Membership Application is Being Processed"
          : results[0].status == "2"
          ? "Congratulations! Your Credit Membership has been approved"
          : results[0].status == "3"
          ? "Credit Membership Application Rejected"
          : "",
    });
    //console.log("############creditaccountstatus############", results);
    res.send({ updateStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};
const deleteSubCategory = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteSubCategory CNT 11111", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteSubCategory(req.body);
    console.log("delete deleteSubCategory CNT 44444", result);
    res.status(200).send({ message: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const result = await cyrusCMS.deleteCategory(req.body);
    res.send({ deleteCategoryStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};
const deleteFilter = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteFilter CNT", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteFilter(req.body);
    console.log("delete deleteFilter CNT", result);
    res.status(200).send({ message: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const uploadImage = async (req, res) => {
  try {
    const result = await cyrusCMS.uploadImage(req);
    console.log("uploadImage CNT result =", result);
    if (result) {
      res.status(200).send({
        data: result,
      });
    }
  } catch (error) {
    console.log("ERROR IN uploadImage", error);
    res.status(500).send({ message: `Error in uploadImage ${error}` });
  }
};
const deleteUploadImage = async (req, res) => {
  try {
    const result = await cyrusCMS.deleteUploadImage(req);
    console.log("deleteUploadImage CNT result =", result);
    if (result) {
      res.status(200).send({
        data: result,
      });
    }
  } catch (error) {
    console.log("ERROR IN deleteUploadImage", error);
    res.status(500).send({ message: `Error in deleteUploadImage ${error}` });
  }
};

const getIndustriesTable = async (req, res) => {
  try {
    const IndustriesTable = await cyrusCMS.getIndustriesTable(req.body);
    const IndustriesTableCount = await cyrusCMS.getIndustriesTableCount(
      req.body
    );

    const resFormat = {
      data: [],
    };
    // new for new industries page
    let data = IndustriesTable;
    console.log("data", data);
    for (let i = 0; i < data.length; i++) {
      let a = data[i]?.category_name?.split("=");
      // console.log(a);
      data[i].category_name = a;
    }
    // if (data.length > 0) {
    //   // console.log("if");
    //   res.send(data);
    // } else {
    //   // console.log("else");
    //   res.status(204).send(data);
    // }
    // console.log("user : after login :", orders.length);
    if (IndustriesTable.length > 0) {
      const userObj = {
        IndustriesTablecms: {
          // data: IndustriesTable,
          data: data,
          total: IndustriesTableCount[0].total,
        },
      };

      resFormat.data = userObj;
      console.log("userObj in getIndustriesTable @@@@@@@@@@@@@@@@@@", userObj);

      res.status(200).send(resFormat);
    } else {
      resFormat.data = [];
      res.status(204).send(resFormat);
    }
  } catch (e) {
    console.log(" getIndustriesTable Error :", e);
    res.status(500).send([]);
  }
};

const getAssemblySolutionsTable = async (req, res) => {
  try {
    const AssemblySolutionsTable = await cyrusCMS.getAssemblySolutionsTable(
      req.body
    );
    const AssemblySolutionsTableCount =
      await cyrusCMS.getAssemblySolutionsTableCount(req.body);

    const resFormat = {
      data: [],
    };
    console.log(
      "############## AssemblySolutionsTable",
      AssemblySolutionsTable
    );
    // if (data.length > 0) {
    //   // console.log("if");
    //   res.send(data);
    // } else {
    //   // console.log("else");
    //   res.status(204).send(data);
    // }
    // console.log("user : after login :", orders.length);
    if (AssemblySolutionsTable.length > 0) {
      const userObj = {
        IndustriesTablecms: {
          data: AssemblySolutionsTable,
          total: AssemblySolutionsTableCount[0].total,
        },
      };

      resFormat.data = userObj;
      console.log(
        "userObj in getAssemblySolutionsTable @@@@@@@@@@@@@@@@@@",
        userObj
      );

      res.status(200).send(resFormat);
    } else {
      resFormat.data = [];
      res.status(204).send(resFormat);
    }
  } catch (e) {
    console.log(" getAssemblySolutionsTable Error :", e);
    res.status(500).send([]);
  }
};

const saveIndustry = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const industry = await cyrusCMS.saveIndustry(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveIndustry: "success" });
  } catch (e) {
    console.log(" saveIndustry Error :", e);
    res.status(500).send([]);
  }
};
const saveAssemblySolutions = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const assemblySolutions = await cyrusCMS.saveAssemblySolutions(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveIndustry: "success" });
  } catch (e) {
    console.log(" saveIndustry Error :", e);
    res.status(500).send([]);
  }
};
const deleteIndustry = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteIndustry CNT 11111", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteIndustry(req.body);
    console.log("delete deleteIndustry CNT 44444", result);
    res.status(200).send({ data: result });
  } catch (e) {
    res.status(500).send([]);
  }
};
const deleteAssemblySolutions = async (req, res) => {
  console.log("delete deleteAssemblySolutions CNT 11111", req.body);
  try {
    const result = await cyrusCMS.deleteAssemblySolutions(req.body);
    console.log("delete deleteAssemblySolutions CNT 44444", result);
    res.status(200).send({ data: result });
  } catch (e) {
    res.status(500).send([]);
  }
};

const updateIndustry = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.updateIndustry(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getBrandsTable = async (req, res) => {
  try {
    const BrandsTable = await cyrusCMS.getBrandsTable(req.body);
    const BrandsTableCount = await cyrusCMS.getBrandsTableCount(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (BrandsTable.length > 0) {
      const userObj = {
        BrandsTablecms: {
          data: BrandsTable,
          total: BrandsTableCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.status(200).send(resFormat);
    } else {
      resFormat.data = [];
      res.status(204).send(resFormat);
    }
  } catch (e) {
    console.log(" getBrandsTable Error :", e);
    res.status(500).send([]);
  }
};

const saveBrand = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const brand = await cyrusCMS.saveBrand(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveBrand: "success" });
  } catch (e) {
    console.log(" saveBrand Error :", e);
    res.status(500).send([]);
  }
};
const deleteBrand = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteBrand CNT 11111", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteBrand(req.body);
    console.log("delete deleteBrand CNT 44444", result);
    res.status(200).send({ data: result });
  } catch (e) {
    res.status(500).send([]);
  }
};

const updateBrand = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.updateBrand(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateCategory: "success" });
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const getCataloguesTable = async (req, res) => {
  try {
    const CataloguesTable = await cyrusCMS.getCataloguesTable(req.body);
    const CataloguesTableCount = await cyrusCMS.getCataloguesTableCount(
      req.body
    );

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (CataloguesTable.length > 0) {
      const userObj = {
        CataloguesTablecms: {
          data: CataloguesTable,
          total: CataloguesTableCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.status(200).send(resFormat);
    } else {
      resFormat.data = [];
      res.status(204).send(resFormat);
    }
  } catch (e) {
    console.log(" getCataloguesTable Error :", e);
    res.status(500).send([]);
  }
};

const saveCatalogue = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const catalogue = await cyrusCMS.saveCatalogue(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveCatalogue: "success" });
  } catch (e) {
    console.log(" saveCatalogues Error :", e);
    res.status(500).send([]);
  }
};
const deleteCatalogue = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteCatalogue CNT 11111", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteCatalogue(req.body);
    console.log("delete deleteCatalogue CNT 44444", result);
    res.status(200).send({ data: result });
  } catch (e) {
    res.status(500).send([]);
  }
};

const updateCatalogue = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.updateCatalogue(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ updateCatalogue: "success" });
  } catch (e) {
    console.log(" updateCatalogue Error :", e);
    res.status(500).send([]);
  }
};

const getCmsUserTable = async (req, res) => {
  try {
    const usertable = await cyrusCMS.getCmsUserTableData(req.body);
    const userCount = await cyrusCMS.getCmsUserTableCount(req.body);

    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (usertable.length > 0) {
      const userObj = {
        usertablecms: {
          data: usertable,
          total: userCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log("getCmsUserTable Error ::::::::::", e);
    res.status(500).send([]);
  }
};

const addCmsUser = async (req, res) => {
  try {
    // console.log('In Edit Product :::::::::::::::',req.body)
    const category = await cyrusCMS.addCmsUser(req.body);
    // console.log('In Main Banner:::::::::::::::::',banner)

    res.send({ saveCategory: "success" });
  } catch (e) {
    console.log("Error addCmsUser:", e);
    res.status(500).send([]);
  }
};

const activeCmsUser = async (req, res) => {
  try {
    const user = await cyrusCMS.activeCmsUser(req.body);
    res.send({ activeUserStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const inactiveCmsUser = async (req, res) => {
  try {
    const user = await cyrusCMS.inactiveCmsUser(req.body);
    res.send({ inactiveUserStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const uploadCustPreAssembleData = async (req, res) => {
  try {
    // console.log("Upload Excel >>>>>>>>>", req.body);
    const uploadCustPreAssembleDataResponse =
      await cyrusCMS.uploadCustPreAssembleData(req.body);

    const resFormat = {
      data: [],
    };

    resFormat.data = uploadCustPreAssembleDataResponse;

    res.send(resFormat);
  } catch (e) {
    console.log("uploadCustPreAssembleData error :", e);
    res.status(500).send([]);
  }
};

const getCustPreassembleTable = async (req, res) => {
  try {
    const products = await cyrusCMS.getCustPreassembleTableData(req.body);
    const productCount = await cyrusCMS.getCustPreassembleTableCount(req.body);

    const resFormat = {
      data: [],
    };
    console.log("user : after login :", products.length);
    if (products.length > 0) {
      // convert jacket_color to array
      if (req.body.type == "cables") {
        for (let i = 0; i < products.length; i++) {
          let jacketColorArray = products[i].jacket_colour.split(",");
          products[i].jacket_colour = jacketColorArray;
        }
      }
      console.log("ppppppppppppp products", products[0]);
      const userObj = {
        productslistdatacms: {
          data: products,
          total: productCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      const userObj = {
        productslistdatacms: {
          data: [],
          total: 0,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    }
  } catch (e) {
    console.log(" Login Error :", e);
    res.status(500).send([]);
  }
};

const deleteCMSUser = async (req, res) => {
  // console.log("delete deleteSubCategory CNT 00000", req);
  console.log("delete deleteCMSUser CNT", req.body);
  // console.log("delete deleteSubCategory CNT 22222", req.data);
  try {
    const result = await cyrusCMS.deleteCMSUser(req.body);
    console.log("delete deleteCMSUser CNT 44444", result);
    res.status(200).send({ data: result });
  } catch (e) {
    res.status(500).send([]);
  }
};

const getQuotationsTable = async (req, res) => {
  try {
    const usertable = await cyrusCMS.getQuotationsTableData(req.body);
    const userCount = await cyrusCMS.getQuotationsTableCount(req.body);
    // console.log("getQuotationsTable usertable = ", usertable);
    const resFormat = {
      data: [],
    };
    // console.log("user : after login :", orders.length);
    if (usertable.length > 0) {
      const userObj = {
        usertablecms: {
          data: usertable,
          total: userCount[0].total,
        },
      };

      resFormat.data = userObj;

      res.send(resFormat);
    } else {
      resFormat.data = [];
      res.send(resFormat);
    }
  } catch (e) {
    console.log("getCmsUserTable Error ::::::::::", e);
    res.status(500).send([]);
  }
};

const getQuoteData = async (req, res) => {
  try {
    // console.log("getOrderDetails CONTROLLER req==============>", req.body);
    let data = await cyrusCMS.getQuoteData(req.body);
    console.log(" getOrderDetails CONTROLLER DATA =>", data);
    if (data.length > 0) {
      res.status(200).send({ data: data, msg: "request successful" });
    } else {
      res.status(404).send({ msg: "Data not found" });
    }
  } catch (e) {
    console.log(" getQuoteData CONTROLLER Error :", e);
    res.status(500).send({ msg: "Internal Server Error" });
  }
};

const crudVoucher = async (req, res) => {
  try {
    // console.log("Upload Excel >>>>>>>>>", req.body);
    const crudVoucherResponse = await cyrusCMS.crudVoucher(req.body);

    const resFormat = {
      data: [],
      message: "request suceess!",
    };

    resFormat.data = crudVoucherResponse;

    res.status(200).send(resFormat);
  } catch (e) {
    console.log("crudVoucher error :", e);
    res.status(500).send([]);
  }
};
const crudProductDiscount = async (req, res) => {
  try {
    const crudProductDiscountResponse = await cyrusCMS.crudProductDiscount(
      req.body
    );
    console.log(
      "crudProductDiscountResponse  >>>>>>>>>",
      crudProductDiscountResponse
    );

    const resFormat = {
      data: [],
      message: "request suceess!",
    };

    resFormat.data = crudProductDiscountResponse;

    res.status(200).send(resFormat);
  } catch (e) {
    console.log("crudVoucher error :", e);
    res.status(500).send([]);
  }
};
const crudProductFilters = async (req, res) => {
  try {
    const crudProductFiltersResponse = await cyrusCMS.crudProductFilters(
      req.body
    );
    console.log(
      "crudProductFiltersResponse  >>>>>>>>>",
      crudProductFiltersResponse
    );
    if (crudProductFiltersResponse) {
      const resFormat = {
        data: [],
        message: "request suceess!",
      };

      resFormat.data = crudProductFiltersResponse;

      res.status(200).send(resFormat);
    } else {
      res.status(500).send([]);
    }
  } catch (e) {
    if(e){
        res.status(e.statusCode).send({ message: e.message });
    }else{
        console.log("crudProductFilters error :", e);
        res.status(500).send([]);
    }
   
  }
};

const createOrderInTLM = async (req, res) => {
  try {
    const data = await cyrusCMS.createOrderInTLM(req, res);
  } catch (e) {
    console.log(" getShippingCharges CONTROLLER Error :", e);
    res.status(500).send(null);
  }
};

const duplicateProduct = async (req, res) => {
  try {
    const product = await cyrusCMS.duplicateProduct(req.body);
    res.send({ duplicateProductStatus: "success" });
  } catch (e) {
    res.status(500).send([]);
  }
};

const dashboardData = async (req, res) => {
  try {
    const dashboardParameters = await cyrusCMS.dashboardData();
    res.status(200).send(dashboardParameters);
  } catch (e) {
    console.log("dashboardData Error ::::::::::", e);
    res.status(500).send([]);
  }
};

const check = async (req, res, next) => {
  console.log("req query in check", req.query);
  // const { id } = req.query;
  // if (!id) {
  //   res.status(404).send({ message: "id not provided" });
  // }
  const checkResponse = await cyrusCMS.check(req.query);
  res.status(200).json(checkResponse);
};

const getProductFiltersBySubCatId = async (req, res) => {
  try {
    const subCatId = req.body.subCatId || req.query.subCatId;
    if (!subCatId) {
      return res.status(400).send({ message: "subCatId is required" });
    }
    const result = await cyrusCMS.getProductFiltersBySubCatId(subCatId);
    if (result) {
      res.status(200).send({ data: result });
    } else {
      res.status(404).send({ message: "No data found" });
    }
  } catch (e) {
    console.log("getProductFiltersBySubCatId error :", e);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  userLogin,
  getCategoryTable,
  getSubCategoryTable,
  getSubSubCategoryTable,
  getCategorycms,
  getCategoryRelatedData,
  addCategory,
  updateCategory,
  addSubSubCategory,
  updateSubSubCategory,
  getProductRelatedData,
  saveProduct,
  getProductTable,
  updateProduct,
  addMainBanner,
  updateMainBanner,
  getMainBannerTable,
  getBannerTable,
  updateBanner,
  deleteBanner,
  getContentTable,
  addContentData,
  deleteContent,
  updateContent,
  getFiltersAccordingToCategory,
  addFilterWithCategory,
  updateManageFilter,
  getSubCategoryTitleTable,
  updateManageSubcategoryTitle,
  deleteSubcategoryTitle,
  addSubcategoryTitle,
  updateProductStockByExcel,
  getStockTable,
  getOrdersList,
  getOrderDetails,
  getUserTable,
  saveOrdersLogs,
  getOrderLogs,
  activeUser,
  inactiveUser,
  getexpotProductList,
  updateErpNumber,
  getexportOrderList,
  getProductDetailByID,
  deleteProduct,
  sendShippingEmail,
  getCreditMembersList,
  UpdateStatusCreditAccount,
  deleteSubCategory,
  deleteCategory,
  deleteFilter,
  uploadImage,
  deleteUploadImage,
  getIndustriesTable,
  saveIndustry,
  deleteIndustry,
  updateIndustry,
  getBrandsTable,
  saveBrand,
  deleteBrand,
  updateBrand,
  getCataloguesTable,
  saveCatalogue,
  deleteCatalogue,
  updateCatalogue,
  getCmsUserTable,
  addCmsUser,
  activeCmsUser,
  inactiveCmsUser,
  uploadCustPreAssembleData,
  getCustPreassembleTable,
  deleteCMSUser,
  getQuotationsTable,
  getQuoteData,
  getAssemblySolutionsTable,
  saveAssemblySolutions,
  deleteAssemblySolutions,
  crudVoucher,
  crudProductDiscount,
  crudProductFilters,
  createOrderInTLM,
  duplicateProduct,
  dashboardData,
  check,
  getProductFiltersBySubCatId,
};
