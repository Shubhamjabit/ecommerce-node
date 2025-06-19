const express = require("express");
const cyrusSync = require("../controllers/cyrusWeb.controller");
const passport = require("passport");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/webCategory", cyrusSync.categorySyncController);
router.post("/webAttribute", cyrusSync.webAttribute);
router.get("/HomePageData", cyrusSync.HomePageData);
// router.get("/preassemblesData", cyrusSync.preassemblesData);
router.post("/subCategoryByFilter", cyrusSync.subCategoryByFilter);
router.post("/register", cyrusSync.register);
router.post("/login", cyrusSync.login);
router.post(
  "/getUserDetailsFromDB",
  auth("/getUserDetailsFromDB"),
  cyrusSync.getUserDetailsFromDB
);
// router.post(
//   "/updateUserProfile",
//   passport.authenticate("jwt", { session: false }),
//   cyrusSync.updateUserProfile
// );
router.post("/updateUserProfile", auth(), cyrusSync.updateUserProfile);
router.post("/updatePassword", auth(), cyrusSync.updatePassword);
router.post(
  "/updatePasswordFromResetLink",
  cyrusSync.updatePasswordFromResetLink
);
router.post("/logout", cyrusSync.userLogout);
router.post(
  "/eyJhdHRyaWJ1dGVzIjp7InVzZXJfYXR0cmlidXRlIjoicmFzaHBhbDI5QGdtYWlsLmNvbSJ9LCJ1c2VySWQiOm51bGx9",
  cyrusSync.loginStatus
);
router.post("/productSearch", cyrusSync.getProductSearch);
router.get("/getProducts", cyrusSync.getProducts);
router.get("/getCategories", cyrusSync.getCategories);
router.post(
  "/saveFinalOrder",
  // auth(),
  cyrusSync.saveFinalOrder
);
router.post("/validateEmail", cyrusSync.checkEmailExist);
router.post("/resetPassword", cyrusSync.resetPassword);
router.post("/verifyTokens", cyrusSync.verifyTokens);
router.post(
  "/uploadCreditMemberForm",
  auth(),
  cyrusSync.uploadCreditMemberForm
);
router.delete(
  "/uploadCreditMemberForm",
  auth(),
  cyrusSync.deleteUploadCreditMemberForm
);
router.post("/getCreditFormsList", auth(), cyrusSync.getCreditFormsList);
router.get("/getBrandsList", cyrusSync.getBrandsList);
router.get("/getCataloguesList", cyrusSync.getCataloguesList);
router.get("/getPreassemblesCategory", cyrusSync.getPreassemblesCategory);
router.get("/getCustPreassemblesData", cyrusSync.getCustPreassemblesData);
router.post("/saveQuotation", auth(), cyrusSync.saveQuotation);
router.post("/getShippingCharges", cyrusSync.getShippingCharges);
router.post("/saveCreditPayment", auth(), cyrusSync.saveCreditPayment);
router.post("/eFormObject", auth(), cyrusSync.eFormObject);
router.post("/wishlist", auth(), cyrusSync.handleWishlist);
router.get("/wishlist/:id", auth(), cyrusSync.getWishlist);
router.get("/myOrders", auth(), cyrusSync.getMyOrders);
router.post("/getProductFilters", cyrusSync.getProductFilters);
router.post("/getProductsByFilters", cyrusSync.getProductsByFilters);
router.post("/chargeRequest", cyrusSync.chargeRequest);
router.post("/sendEnquiry", cyrusSync.sendEnquiry);
router.post(
  "/saveCustomProductQuote",
  auth(),
  cyrusSync.saveCustomProductQuote
);

module.exports = router;
