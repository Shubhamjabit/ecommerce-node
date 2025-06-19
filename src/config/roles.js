const roleRights = new Map([
  [
    "admin",
    [
      "/updateUserProfile",
      "/getUserDetailsFromDB",
      "/updatePassword",
      "/saveFinalOrder",
      "/uploadCreditMemberForm",
      "/deleteUploadCreditMemberForm",
      "/getCreditFormsList",
      "/saveQuotation",
      "/saveCreditPayment",
      "/eFormObject",
      "/wishlist",
      "/wishlist/:id",
      "/myOrders",
      "/saveCustomProductQuote",
    ],
  ],
  ["regular", []],
  ["all", []],
]);

module.exports = {
  roleRights,
};

// module.exports = {
//   admin: "*",
//   regular: "",
//   all: "",
// };
