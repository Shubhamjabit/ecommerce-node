const config = require("../config/config");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config.sendgridKey);

const resetPasswordMail = async (data) => {
  console.log(" DATAT AT SEND EMAIL resetPasswordMail:", data);
  // console.log("##############Email", JSON.stringify(data.email));
  const msg = {
    to: data.email,
    // to: "ishaangupta.cdac@gmail.com",
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    templateId:
      config.node_env == "prod"
        ? "d-a721b216c4dd408b91eeb1b73dd924a1"
        : "d-345e061ed83c4ec0ab5744f5008355b8",
    dynamic_template_data: data,
  };
  await sgMail
    .send(msg)
    .then((response) => {
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.log("ERROR IN resetPasswordMail MAIL :???????????????? ");
      console.error(error);
    });
};

const sendShippingEmail = async (req) => {
  console.log("DATA AT SEND EMAIL FOR sendShippingEmail :", req);
  const msg = {
    to: req.email,
    // to: "manish@jabitsoft.com",
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    bcc: req.email == "ishaan@jabitsoft.com" ? [] : ["ishaan@jabitsoft.com"],
    templateId:
      config.node_env == "prod"
        ? "d-6e6630943b3b49cc83058cc66df2e2fd"
        : "d-4be713c4c2cd40da9e3b0c12379e469d",
    dynamic_template_data: req,
  };
  await sgMail
    .send(msg)
    .then((response) => {
      console.log("SUCCESS IN sendShippingEmail MAIL ");
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.log("ERROR IN sendShippingEmail MAIL :???????????????? ");
      console.error(error);
    });
};

const sendMailOrderConfirm = async (emailJson) => {
  console.log(" DATA AT SEND EMAIL FOR sendMailOrderConfirm :", emailJson);

  var msg = {};
  if (emailJson.email == "ishaan@jabitsoft.com") {
    msg = {
      to: emailJson.email,
      from: {
        email:
          config.node_env == "prod"
            ? "sales@sparkywarehouse.com.au"
            : "info@jabitsoft.com",
        name: "Sparky Team ",
      },
      templateId:
        config.node_env == "prod"
          ? "d-07c3f245647a4fcfbdbe42fdbda9601d"
          : "d-0951fff647e94eef9f94de98bc05f157",
      dynamic_template_data: emailJson,
    };
  } else {
    msg = {
      to: emailJson.email,
      // to: "manish@jabitsoft.com",
      from: {
        email:
          config.node_env == "prod"
            ? "sales@sparkywarehouse.com.au"
            : "info@jabitsoft.com",
        name: "Sparky Team ",
      },
      bcc: [
        "ishaan@jabitsoft.com",
        // "baldeepsingh@jabitsoft.com",
      ],
      /*
      {
        email: "igupta91098@gmail.com",
        // name: "",
      },
      */
      templateId:
        config.node_env == "prod"
          ? "d-07c3f245647a4fcfbdbe42fdbda9601d"
          : "d-0951fff647e94eef9f94de98bc05f157",
      dynamic_template_data: emailJson,
    };
  }

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("SUCCESS IN sendMailOrderConfirm MAIL ");
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.log("ERROR IN sendMailOrderConfirm MAIL :???????????????? ");
      console.error(error);
    });
};

const creditAccountMail = async (data) => {
  console.log(" DATAT AT SEND EMAIL :", data);
  const msg = {
    to: data.email,
    from: { email: "info@jabitsoft.com", name: "Sparky Team" },
    templateId:
      config.node_env == "prod"
        ? "d-1c52a37f696a4d459555321fed1b66f9"
        : "d-21efb55f034040998e4615a6426f3d7b",
    dynamic_template_data: { data },
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

const welcomeMailOnSignUp = async (data) => {
  console.log(" DATAT AT welcomeMailOnSignUp :", data);
  console.log(" config.node_env AT welcomeMailOnSignUp :", config.node_env);
  const msg = {
    to: data.email,
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    templateId:
      config.node_env == "prod"
        ? "d-490397c8f5b9496fbafa3e812f0d1deb"
        : "d-989249671c05414d99bb6af2060e1c87",
    dynamic_template_data: data,
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("welcomeMailOnSignUp :", response[0].statusCode);
      console.log("welcomeMailOnSignUp HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

const sendEnquiryEmailToSparky = async (data) => {
  console.log(" DATAT AT sendEnquiryEmailToSparky :", data);
  const msg = {
    // to: "sales@sparkywarehouse.com.au", need to change to this in live
    to:
      config.node_env == "prod"
        ? "sales@sparkywarehouse.com.au"
        : "ishaan@jabitsoft.com",
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    templateId:
      config.node_env == "prod"
        ? "d-57a90dd9f6fa49059b7b0f2850e74c01"
        : "d-0883c5073a6347969ccfe95a1805847e",
    dynamic_template_data: data,
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("sendEnquiryEmailToSparky :", response[0].statusCode);
      console.log("sendEnquiryEmailToSparky HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

const sendEnquiryEmailToCustomer = async (data) => {
  console.log(" DATAT AT sendEnquiryEmailToCustomer :", data);
  const msg = {
    to: data.email,
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    templateId:
      config.node_env == "prod"
        ? "d-4416e685555a4ae1acf340504d99b38f"
        : "d-51a3d3ce4c374373b2c56b21f194509a",
    dynamic_template_data: data,
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("sendEnquiryEmailToCustomer :", response[0].statusCode);
      console.log("sendEnquiryEmailToCustomer HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};

const sendNotRegularProductEmail = async (emailJson) => {
  console.log(
    " DATA AT SEND EMAIL FOR sendNotRegularProductEmail :",
    emailJson
  );
  var msg = {};
  if (emailJson.email == "ishaan@jabitsoft.com") {
    msg = {
      to: emailJson.email,
      from: {
        email:
          config.node_env == "prod"
            ? "sales@sparkywarehouse.com.au"
            : "info@jabitsoft.com",
        name: "Sparky Team",
      },
      templateId:
        config.node_env == "prod"
          ? "d-c7d29343b3a4403f811b24d917bcea44"
          : "d-cd67651a905042bdaf19dab075e0c58e",
      dynamic_template_data: emailJson,
    };
  } else {
    msg = {
      to: emailJson.email,
      // to: "manish@jabitsoft.com",
      from: {
        email:
          config.node_env == "prod"
            ? "sales@sparkywarehouse.com.au"
            : "info@jabitsoft.com",
        name: "Sparky Team",
      },
      bcc: [
        "ishaan@jabitsoft.com",
        // "baldeepsingh@jabitsoft.com",
      ],
      /*
      {
        email: "igupta91098@gmail.com",
        // name: "",
      },
      */
      templateId:
        config.node_env == "prod"
          ? "d-c7d29343b3a4403f811b24d917bcea44"
          : "d-cd67651a905042bdaf19dab075e0c58e",
      dynamic_template_data: emailJson,
    };
  }

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("SUCCESS IN sendNotRegularProductEmail MAIL ");
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.log(
        "ERROR IN sendNotRegularProductEmail MAIL :???????????????? "
      );
      console.error(error);
    });
};

const sendNotRegularProductEmailToSparky = async (emailJson) => {
  console.log(
    " DATA AT SEND EMAIL FOR sendNotRegularProductEmailToSparky :",
    emailJson
  );
  var msg = {};

  msg = {
    to:
      config.node_env == "prod"
        ? "sales@sparkywarehouse.com.au"
        : "ishaan@jabitsoft.com",
    from: {
      email:
        config.node_env == "prod"
          ? "sales@sparkywarehouse.com.au"
          : "info@jabitsoft.com",
      name: "Sparky Team",
    },
    bcc: config.node_env == "prod" ? ["ishaan@jabitsoft.com"] : [],
    templateId:
      config.node_env == "prod"
        ? "d-2e3157f4b317453abd3547c268f5e911"
        : "d-cd67651a905042bdaf19dab075e0c58e",
    dynamic_template_data: emailJson,
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log("SUCCESS IN sendNotRegularProductEmailToSparky MAIL ");
      console.log("MAIL :", response[0].statusCode);
      console.log("MAIL HEADERS :", response[0].headers);
    })
    .catch((error) => {
      console.log(
        "ERROR IN sendNotRegularProductEmailToSparky MAIL :???????????????? "
      );
      console.error(error);
    });
};

module.exports = {
  resetPasswordMail,
  sendShippingEmail,
  sendMailOrderConfirm,
  creditAccountMail,
  welcomeMailOnSignUp,
  sendEnquiryEmailToSparky,
  sendEnquiryEmailToCustomer,
  sendNotRegularProductEmail,
  sendNotRegularProductEmailToSparky,
};
