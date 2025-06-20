const httpStatus = require("http-status");
// const tokenService = require('./token.service');
const config = require("../config/config");
const mysql = require("mysql2/promise");
const mssql = require("mssql");
const ApiError = require("../utils/ApiError");
const moment = require("moment");
const sql = require("mssql");
const UUIDV4 = require("uuid4");
const { default: axios } = require("axios");
const parse = require("html-react-parser");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config.sendgridKey);
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

/**
 *  Latest Lead Data transfer
 * @param {string} noparameters
 * @returns {Promise}
 */

const logUserActivity = async (email, logType, status, logText) => {
  try {
    let conn = await new mssql.connect(config.mssqlDBConfig);
    const ausTime = moment()
      .tz("Australia/Sydney")
      .format("yyyy-MM-DD hh:mm:ss");
    // console.log("AUR TIME ::  :", ausTime);
    const logResult = await mssql.query`INSERT INTO 
    dbo.Tbl_web_loginAudit
    ( loginid,
      logType,
      timestamp,
      logStatus,
      logText )
    VALUES
    (${email},${logType},${ausTime},${status},${logText})`;
    // console.log("logResult : : : ", logResult.rowsAffected);
    conn.close();
  } catch (e) {
    console.log("In User Login Activity Error:", e);
  }
};

const GetLoginDetils = async (email, password) => {
  let conn = "";
  try {
    // console.log('email in auth service:', email, 'pass :', password);

    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select   id,status  from  ${config.env}.admin_login  WHERE  admin_emailid = '${email}' AND   admin_password = '${password}'`
    );

    console.log("results Query executed >>>>>>>>>>>>>>:", results);
    if (results.length > 0) {
      if (results[0].status == 1) {
        logUserActivity(email, "SIGN-INAdmin", "SUCCESS", "");
      } else {
        return [{ message: "inactive" }];
      }
    } else {
      logUserActivity(email, "SIGN-INAdmin", "FAIL", "PASSWORD INVALID");
    }

    await conn.close();

    return results;
  } catch (error) {
    console.log("In Login Details Error :", error);

    // await conn.close();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const logout = async (email) => {
  console.log("--in logout service :--:", email);
  await logUserActivity(email, "SIGN-OUT", "SUCCESS", "LOGOUT");
};

const getCategoryTableData = async (req) => {
  console.log("In category", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    if (req.type == "stockPreassemblesCategory") {
      const [results] = await conn.execute(
        `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url
        FROM ${config.env}.stock_preassembles_category as c where level=1 order by priority asc  LIMIT ${pagefrom}, ${req.pageSize}`
      );
      conn.end();
      return results;
    } else {
      console.log(`SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url
      FROM ${config.env}.category as c where level=1 order by priority asc LIMIT ${pagefrom}, ${req.pageSize}`);
      const [results] = await conn.execute(
        `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url
      FROM ${config.env}.category as c where level=1 order by priority asc LIMIT ${pagefrom}, ${req.pageSize}`
      );
      // console.log("getCategoryTableData", results);
      conn.end();
      return results;
    }
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getCategoryTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    if (req.type == "stockPreassemblesCategory") {
      const [results] = await conn.execute(
        `select count(1) as total  from  ${config.env}.category where level=1 and name like '%${req.key}%'`
      );
      conn.end();
      return results;
    } else {
      const [results] = await conn.execute(
        `select count(1) as total  from  ${config.env}.category where level=1 and name like '%${req.key}%'`
      );
      conn.end();
      return results;
    }
  } catch (e) {
    console.log("In Product Enquiry Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSubCategoryTableData = async (req) => {
  console.log("In category", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',uuid,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level)) from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories  
      FROM ${config.env}.category as c where name like '%${req.key}%' and level=2 order by id asc  LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSubCategoryTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.category where level=2 and name like '%${req.key}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSubSubCategoryTableData = async (req) => {
  console.log("getSubSubCategoryTableData :::::::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    //  const [results] = await conn.execute(
    //    `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',uuid,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level,'image_url',image_url)) from ${config.env}.category_filter as cf where cf.parent_id = c.id) category_filter
    //   FROM ${config.env}.category as c where name like '%${req.key}%' and level=2 order by id asc  LIMIT ${pagefrom}, ${req.pageSize}`
    //  );

    // const [results] = await conn.execute(
    //   `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   ( SELECT JSON_ARRAYAGG(JSON_OBJECT('filter_name',fm.filter_name,'id',fm.id)) FROM category_filter as cf left outer join filter_master as fm
    //   on cf.filter_id=fm.id where cf.sub_cate_id=c.id) as cate_filter
    //   FROM ${config.env}.category as c where name like '%${req.key}%' and level=2 order by id asc  LIMIT ${pagefrom}, ${req.pageSize}`
    // );

    // No limit for filters to work
    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
      ( SELECT JSON_ARRAYAGG(JSON_OBJECT('filter_name',fm.filter_name,'id',fm.id)) FROM ${config.env}.category_filter as cf left outer join ${config.env}.filter_master as fm  
      on cf.filter_id=fm.id where cf.sub_cate_id=c.id) as cate_filter
      FROM ${config.env}.category as c where name like '%${req.key}%' and level=2 order by id asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSubSubCategoryTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.category where level=2 and name like '%${req.key}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getCategorycmsData = async (req) => {
  console.log("In category", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',uuid,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level,'image_url',image_url)) from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories  
      FROM ${config.env}.category  as c order by id asc  LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getCategoryData = async () => {
  // console.log("In Get Category All Data ::::");
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',fm.id,'filter_name',fm.filter_name,'category_id',fm.category_id, 'related_category',
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('parent_id',cc.parent_id,'status',cc.status,'name',cc.name,'priority',cc.priority,
       'level',cc.level,'image_url',cc.image_url,'meta_keywords',cc.meta_keywords,'meta_title',cc.meta_title,'meta_description',cc.meta_description))
      from ${config.env}.category_filter as cf left outer join category as cc on cc.id = cf.sub_cate_id where fm.id = cf.filter_id ))
      )
      from ${config.env}.filter_master as fm where fm.category_id = c.id order by fm.id desc) category_filter,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',stm.id,'subcategory_title',stm.subcategory_title,'category_id',stm.category_id
      ))
      from ${config.env}.subcategory_title_master as stm where stm.category_id = c.id order by stm.id desc) subcategory_title
      FROM ${config.env}.category  as c where level=1  order by c.priority asc `
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Get Category All Data Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getFilterData = async () => {
  // console.log("In Get Filter All Data ::::");
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,filter_name FROM ${config.env}.filter_master as fm`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In Get Filter All Data Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const saveCategory = async (req) => {
  console.log("In category", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    if (req.type == "stockPreassemblesCategory") {
      await conn.execute(
        `insert into ${config.env}.stock_preassembles_category 
      (status,level,name,priority,parent_id,image_url) 
        values(${req.status},'${req.level}','${req.name}','${req.priority}','${req.parent_id}','${req.imageUrl}')`
      );
    } else {
      await conn.execute(
        `insert into ${config.env}.category 
        (uuid,status,level,name,priority,parent_id,image_url) 
          values('${UUIDV4()}',${req.status},'${req.level}','${req.name}','${
          req.priority
        }','${req.parent_id}','${req.imageUrl}')`
      );
    }

    conn.end();

    return [];
  } catch (e) {
    console.log("save Category Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updatecategory = async (req) => {
  //console.log("In category>>>>>>>>>>>>", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // const [imageDetail] = await conn.execute(
    //   `SELECT img_name FROM ${config.env}.temp_image_hold where prod_id='${req.id}'`
    // );

    await conn.execute(
      `update ${config.env}.category set 
        status=${req.status}
        ,level='${req.level}'
        ,name='${req.name}'
        ,priority='${req.priority}'
        ,parent_id='${req.parent_id}'
        ,image_url='${req.imageUrl}'
         where id='${req.id}'`
    );
    // updating sub cat name also in category table
    await conn.execute(
      `update ${config.env}.category set 
        name=REPLACE(name, SUBSTRING_INDEX(name,'/',1), '${req.name}')
         where parent_id='${req.id}'`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("update category Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const saveSubSubCategory = async (req) => {
  console.log("In category Sub Sub", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `insert into ${config.env}.category 
      (uuid,status,level,name,title,priority,parent_id,meta_description,meta_title,meta_keywords,image_url) 
        values('${UUIDV4()}',${req.status},'${req.level}','${req.name}','${
        req.title
      }','${req.priority}','${req.parent_id}',
        '${req.meta_description ? req.meta_description : ""}','${
        req.meta_title ? req.meta_title : ""
      }','${req.meta_keywords ? req.meta_keywords : ""}','${req.image_url}')`
    );

    //////////////// insert filter by category/////////////////
    if (req.filter && req.filter.length > 0) {
      req.filter.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.category_filter(uuid,cate_id,sub_cate_id,filter_id) values('${UUIDV4()}','${
            req.parent_id
          }','${results.insertId}','${element}')`
        );
      });
    }
    /////////////// end filter by category/////////////////

    conn.end();

    return [];
  } catch (e) {
    console.log("save Sub Sub Category Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updatesubsubcategory = async (req) => {
  //console.log("In category>>>>>>>>>>>>", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    await conn.execute(
      `update ${config.env}.category set 
        status=${req.status}
        ,level='${req.level}'
        ,name='${req.name}'
        ,priority='${req.priority}'
        ,parent_id='${req.parent_id}'
        ,title='${req.title ? req.title : ""}'
        ,meta_description='${req.meta_description ? req.meta_description : ""}'
        ,meta_title='${req.meta_title ? req.meta_title : ""}'
        ,meta_keywords='${req.meta_keywords ? req.meta_keywords : ""}'
        ,image_url='${req.image_url ? req.image_url : ""}'
         where id='${req.id}'`
    );

    //////////////// update filter by category/////////////////
    if (req.categorystatus || (req.filterstatus && req.filter?.length > 0)) {
      await conn.execute(
        `delete from ${config.env}.category_filter where sub_cate_id='${req.id}'`
      );
      req.filter.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.category_filter(uuid,cate_id,sub_cate_id,filter_id) values('${UUIDV4()}','${
            req.parent_id
          }','${req.id}','${element}')`
        );
      });
    }
    /////////////// end update by category/////////////////

    conn.end();

    return [];
  } catch (e) {
    console.log("update sub sub category Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const getParentCategoryListData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.category as c where level=1 order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("getParentCategoryListData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getParentCategoryListData:${error}`
    );
  }
};

const getCategoryListData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.category as c where level=2 order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSimilarProductsData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.product  where status=1  order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getAlternativeProductsData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.product  where status=1  order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const saveProductData = async (req) => {
  console.log("save product request data ::::", req);
  let conn = "";
  let key_features;
  if (req.product_key_features != "") {
    key_features = parse(req.product_key_features);
  }
  let productDesc = parse(req.description);
  let prdstatus = req.status === true ? 1 : 0;
  let isPreassembles = false;
  let productType = 1;
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

      const [selectQuery] = await conn.query(
      `SELECT name from ${config.env}.category where id=${req.parent_category_id}`
    );
    console.log("!!!!!!!!!1111 selectQuery =", selectQuery);

    if (selectQuery[0].name == "Preassembles") {
      isPreassembles = true;
    }
    if (isPreassembles) {
      productType = 2;
    }
    console.log("!!!!!!!!!22222 isPreassembles =", isPreassembles);
    console.log("!!!!!!!!!3333 productType =", productType);

    console.log(`insert into ${
      config.env
    }.product ( meta_keyword ,name, position,uuid ,slug ,title,meta_description ,status ,product_key_features ,sparky_id ,manufacturer_id ,description,product_type,pallets,weight,length,breadth,height,cbm,custmFilterNumber1,custmFilterNumber2,custmFilterNumber3,custmFilterNumber4,custmFilterNumber5,custmFilterNumber6,custmFilterNumber7,custmFilterNumber8,custmFilterNumber9,custmFilterNumber10,qty_per_pack,qty_type,cable_pricing_permeter,terminal_1_id,terminal_2_id)
    values (
      '${req.metaKeyword}',
      '${req.title}',
      '${req.position}',
      '${UUIDV4()}',
      '${req.slug}',
      '${req.title}',
      '${req.metaDescription}',
      '${prdstatus}',
      '${key_features}',
      '${req.sparky_id}',
      '${req.manufacturer_id}',
      '${productDesc}',
       ${productType},
       ${req.product_pallets},
       ${req.product_weight},
       ${req.product_length},
       ${req.product_breadth},
       ${req.product_height},
       ${req.product_cbm},
       ${req.custmFilterNumber1},
       ${req.custmFilterNumber2 ? req.custmFilterNumber2 : null},
       ${req.custmFilterNumber3 ? req.custmFilterNumber3 : null},
       ${req.custmFilterNumber4 ? req.custmFilterNumber4 : null},
       ${req.custmFilterNumber5 ? req.custmFilterNumber5 : null},
       ${req.custmFilterNumber6 ? req.custmFilterNumber6 : null},
       ${req.custmFilterNumber7 ? req.custmFilterNumber7 : null},
       ${req.custmFilterNumber8 ? req.custmFilterNumber8 : null},
       ${req.custmFilterNumber9 ? req.custmFilterNumber9 : null},
       ${req.custmFilterNumber10 ? req.custmFilterNumber10 : null},
       ${req.qty_per_pack},
       ${req.qty_type},
       ${req.cable_pricing_permeter},
       ${req.terminal_1_id},
       ${req.terminal_2_id}
       )`);
      //  console.log("first one")
    const [results] = await conn.query(
      `insert into ${
        config.env
      }.product ( meta_keyword ,name, position,uuid ,slug ,title,meta_description ,status ,product_key_features ,sparky_id ,manufacturer_id ,description,product_type,pallets,weight,length,breadth,height,cbm,custmFilterNumber1,custmFilterNumber2,custmFilterNumber3,custmFilterNumber4,custmFilterNumber5,custmFilterNumber6,custmFilterNumber7,custmFilterNumber8,custmFilterNumber9,custmFilterNumber10,qty_per_pack,qty_type,cable_pricing_permeter,terminal_1_id,terminal_2_id )
      values (
        '${req.metaKeyword}',
        '${req.title}',
        '${req.position}',
        '${UUIDV4()}',
        '${req.slug}',
        '${req.title}',
        '${req.metaDescription}',
        '${prdstatus}',
        '${key_features}',
        '${req.sparky_id}',
        '${req.manufacturer_id}',
        '${productDesc}',
         ${productType},
         ${req.product_pallets},
         ${req.product_weight},
         ${req.product_length},
         ${req.product_breadth},
         ${req.product_height},
         ${req.product_cbm},
         ${req.custmFilterNumber1 ? `'${req.custmFilterNumber1}'` : null},
         ${req.custmFilterNumber2 ? `'${req.custmFilterNumber2}'` : null},
         ${req.custmFilterNumber3 ? `'${req.custmFilterNumber3}'` : null},
         ${req.custmFilterNumber4 ? `'${req.custmFilterNumber4}'` : null},
         ${req.custmFilterNumber5 ? `'${req.custmFilterNumber5}'` : null},
         ${req.custmFilterNumber6 ? `'${req.custmFilterNumber6}'` : null},
         ${req.custmFilterNumber7 ? `'${req.custmFilterNumber7}'` : null},
         ${req.custmFilterNumber8 ? `'${req.custmFilterNumber8}'` : null},
         ${req.custmFilterNumber9 ? `'${req.custmFilterNumber9}'` : null},
         ${req.custmFilterNumber10 ? `'${req.custmFilterNumber10}'` : null},
         ${req.qty_per_pack},
         '${req.qty_type}',
         ${req.cable_pricing_permeter},
         ${req.terminal_1_id},
         ${req.terminal_2_id}
         )`
    );
    // console.log("Second one")

    await conn.execute(
      `INSERT INTO ${config.env}.stock_master (uid,sparky_id,manufacturer_id,stock,status,product_id) VALUES(?,?,?,?,?,?)`,
      [
        UUIDV4(),
        req.sparky_id,
        req.manufacturer_id,
        req.product_stock,
        1,
        results.insertId,
      ]
    );
   //////////////// insert product by category/////////////////
    // if (req.category_id && req.category_id.length > 0) {
    //   req.category_id.forEach(async (element) => {
    //     await conn.execute(
    //       `insert into ${config.env}.product_category(product_id,category_id) values('${results.insertId}','${element}')`
    //     );
    //   });
    // }

    // new query since sub cat is now single
    await conn.execute(
      `insert into ${config.env}.product_category(product_id,category_id) values('${results.insertId}','${req.category_id}')`
    );

    if (req.industry_id && req.industry_id.length > 0) {
      req.industry_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.industries_product_mapping(product_id,industry_id) values('${results.insertId}','${element}')`
        );
      });
    }
    if (req.brand_id) {
      `insert into ${config.env}.brands_product_mapping(product_id,brand_id) values('${results.insertId}','${req.brand_id}')`;
    }
    /////////////// end product by category/////////////////

    //////////////// insert similar together/////////////////
    if (req.relatedproduct_id && req.relatedproduct_id.length > 0) {
      req.relatedproduct_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_bought_together(product_id,sub_product_id) values('${results.insertId}','${element}')`
        );
      });
    }

    //////////////// end similar together/////////////////

    //////////////// insert alternative together/////////////////
    if (req.alternativeproduct_id && req.alternativeproduct_id.length > 0) {
      req.alternativeproduct_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_alternative_together(product_id,sub_product_id) values('${results.insertId}','${element}')`
        );
      });
    }

    //////////////// end alternative together/////////////////

    //////////////// insert product images/////////////////
    if (req.media && req.media.length > 0) {
      req.media.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_media (uuid,product_id,media_url,priority) 
        values('${element.uid}','${results.insertId}','${element.name}','${element.priority}')`
        );
      });
    }

    //////////////// end product images/////////////////

    //////////////// insert default image/////////////////
    await conn.execute(
      `update ${config.env}.product_media set default_image=1 where uuid='${req.defaultImage}'`
    );
    //////////////// end default image/////////////////

    //////////////// insert certificate data/////////////////s
    if (req.certificate && req.certificate.length > 0) {
      req.certificate.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_certificate(product_id,uuid,certificate_name,certificate_image) values('${
            results.insertId
          }','${UUIDV4()}','${element.CertificateName}','${
            element.CertificateImage
          }')`
        );
      });
    }
    //////////////// end certificate data/////////////////
    //////////////// insert document data/////////////////
    if (req.document && req.document.length > 0) {
      req.document.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_document(product_id,uuid,document_name,document_image) values('${
            results.insertId
          }','${UUIDV4()}','${element.DocumentName}','${
            element.DocumentImage
          }')`
        );
      });
    }
    //////////////// end document data/////////////////
    //////////////// insert Price data/////////////////
    if (req.pricejson && req.pricejson.length > 0) {
      req.pricejson.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_price(sparky_id,manufacturer_id,product_id,uuid,product_quantity,product_price) values('${
            req.sparky_id
          }','${req.manufacturer_id}','${results.insertId}','${UUIDV4()}','${
            element.quantity
          }','${element.price}')`
        );
      });
    }
    //////////////// end Price data/////////////////

    //////////////// insert Section data/////////////////
    if (req.final_section_save && req.final_section_save.length > 0) {
      req.final_section_save.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_tag_map(product_id,tag_id,order_no) values('${results.insertId}','${element.section_id}','${element.section_number_id}')`
        );
      });
    }
    //////////////// end Section data/////////////////

    conn.end();
    return [];
  } catch (e) {
    console.log("save Product Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateProductData = async (req) => {
  console.log("update Product Data ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    if (req.type == "preassembleTerminals") {
      conn.execute(
        `UPDATE ${config.env}.cust_preassembles_terminal_master SET main_filter = ?,manf_id = ?,price = ?,assembly_charges = ?,img_url_t1 = ?,img_url_t2 = ?,status = ?  where sparky_id = ?`,
        [
          req.main_filter,
          req.manf_id,
          req.price,
          req.assembly_charges,
          req.img_url_t1,
          req.img_url_t2,
          req.status,
          req.sparky_id,
        ]
      );
      conn.end();
      return [];
    } else if (req.type == "preassembleCables") {
      conn.execute(
        `UPDATE ${config.env}.cust_preassembles_cables_master SET filter_1 = ?,pricing_per_meter = ?,img_url = ?,status = ? where sparky_id = ?`,
        [
          req.filter_1,
          req.pricing_per_meter,
          req.img_url,
          req.status,
          req.sparky_id,
        ]
      );
      conn.end();
      return [];
    }
    // const [results] = await conn.execute(
    //   `insert into ${config.env}.product set meta_keyword='${
    //     req.metaKeyword
    //   }',name='${req.title}',uuid='${UUIDV4()}',slug='${req.slug}',title='${
    //     req.title
    //   }',meta_description='${req.metaDescription}',
    //   status =${req.status},product_key_features='${
    //     req.product_key_features ? req.product_key_features : ""
    //   }',description='${req.description}',price='${req.price}' `
    // );
    else {
      let key_features;
      if (req.product_key_features && req.product_key_features != "") {
        key_features = parse(req.product_key_features);
      }
      let productDesc = parse(req.description);
      // console.log("!!!!!!!!!!!!! key_features", key_features);
      console.log(
        "%%%%%%%%%%%%%%%%%%%%%%%",
        `UPDATE ${config.env}.product SET meta_keyword = ?,name = ?,position = ?,uuid = ?,slug = ?,title = ?,meta_description = ?,status = ?,product_key_features = ?, description = ?, sparky_id = ?, manufacturer_id = ?, pallets = ?,weight=?,length = ?,breadth = ?, height = ?, cbm = ? , cable_pricing_permeter = ? , terminal_1_id = ? , terminal_2_id = ? , custmFilterNumber1=?,custmFilterNumber2=?,custmFilterNumber3=?,custmFilterNumber4=?,custmFilterNumber5=?,custmFilterNumber6=?,custmFilterNumber7=?,custmFilterNumber8=?,custmFilterNumber9=?,custmFilterNumber10=?,qty_per_pack=? where id = ?`,
        [
          req.metaKeyword,
          req.title,
          req.position,
          UUIDV4(),
          req.slug,
          req.title,
          req.metaDescription,
          req.status,
          key_features,
          productDesc,
          req.sparky_id,
          req.manufacturer_id,
          req.product_pallets,
          req.product_weight,
          req.product_length,
          req.product_breadth,
          req.product_height,
          req.product_cbm,
          req.cable_pricing_permeter,
          req.terminal_1_id,
          req.terminal_2_id,
          req.custmFilterNumber1 ? req.custmFilterNumber1 : null,
          req.custmFilterNumber2 ? req.custmFilterNumber2 : null,
          req.custmFilterNumber3 ? req.custmFilterNumber3 : null,
          req.custmFilterNumber4 ? req.custmFilterNumber4 : null,
          req.custmFilterNumber5 ? req.custmFilterNumber5 : null,
          req.custmFilterNumber6 ? req.custmFilterNumber6 : null,
          req.custmFilterNumber7 ? req.custmFilterNumber7 : null,
          req.custmFilterNumber8 ? req.custmFilterNumber8 : null,
          req.custmFilterNumber9 ? req.custmFilterNumber9 : null,
          req.custmFilterNumber10 ? req.custmFilterNumber10 : null,
          req.qty_per_pack,
          req.qty_type,
          req.id,
        ]
      );
      await conn.query(
        `UPDATE ${config.env}.product SET meta_keyword = ?,name = ?,position = ?,uuid = ?,slug = ?,title = ?,meta_description = ?,status = ?,product_key_features = ?, description = ?, sparky_id = ?, manufacturer_id = ?, pallets = ?,weight=?,length = ?,breadth = ?, height = ?, cbm = ? , cable_pricing_permeter = ? , terminal_1_id = ? , terminal_2_id = ? ,custmFilterNumber1=?,custmFilterNumber2=?,custmFilterNumber3=?,custmFilterNumber4=?,custmFilterNumber5=?,custmFilterNumber6=?,custmFilterNumber7=?,custmFilterNumber8=?,custmFilterNumber9=?,custmFilterNumber10=?,qty_per_pack=?,qty_type=? where id = ?`,
        [
          req.metaKeyword,
          req.title,
          req.position,
          UUIDV4(),
          req.slug,
          req.title,
          req.metaDescription,
          req.status,
          key_features,
          productDesc,
          req.sparky_id,
          req.manufacturer_id,
          req.product_pallets,
          req.product_weight,
          req.product_length,
          req.product_breadth,
          req.product_height,
          req.product_cbm,
          req.cable_pricing_permeter,
          req.terminal_1_id,
          req.terminal_2_id,
          req.custmFilterNumber1 ? req.custmFilterNumber1 : null,
          req.custmFilterNumber2 ? req.custmFilterNumber2 : null,
          req.custmFilterNumber3 ? req.custmFilterNumber3 : null,
          req.custmFilterNumber4 ? req.custmFilterNumber4 : null,
          req.custmFilterNumber5 ? req.custmFilterNumber5 : null,
          req.custmFilterNumber6 ? req.custmFilterNumber6 : null,
          req.custmFilterNumber7 ? req.custmFilterNumber7 : null,
          req.custmFilterNumber8 ? req.custmFilterNumber8 : null,
          req.custmFilterNumber9 ? req.custmFilterNumber9 : null,
          req.custmFilterNumber10 ? req.custmFilterNumber10 : null,
          req.qty_per_pack,
          req.qty_type,
          req.id,
        ]
      );

      await conn.execute(
        `update ${config.env}.stock_master set stock=?,sparky_id=? where product_id=?`,
        [req.product_stock, req.sparky_id, req.id]
      );

      //////////////// insert product by category/////////////////
      if (req.categorystatus && req.category_id.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_category where product_id='${req.id}'`
        );
        req.category_id.forEach(async (element) => {
          await conn.execute(
            `insert into ${config.env}.product_category(product_id,category_id) values('${req.id}','${element}')`
          );
        });
      }
      /////////////// end product by category/////////////////

      //////////////// insert similar together/////////////////
      if (req.relatedproductstatus && req.relatedproduct_id.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_bought_together where product_id='${req.id}'`
        );
        req.relatedproduct_id.forEach(async (element) => {
          await conn.execute(
            `insert into ${config.env}.product_bought_together(product_id,sub_product_id) values('${req.id}','${element}')`
          );
        });
      }

      //////////////// end similar together/////////////////

      //////////////// insert alternative together/////////////////
      if (
        req.alternativeproductstatus &&
        req.alternativeproduct_id.length > 0
      ) {
        await conn.execute(
          `delete from ${config.env}.product_alternative_together where product_id='${req.id}'`
        );
        req.alternativeproduct_id.forEach(async (element) => {
          await conn.execute(
            `insert into ${config.env}.product_alternative_together(product_id,sub_product_id) values('${req.id}','${element}')`
          );
        });
      }

      //////////////// end alternative together/////////////////

      //////////////// insert product images/////////////////
      if (req.uploadimagestatus && req.media.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_media where product_id='${req.id}'`
        );
        req.media.forEach(async (element) => {
          await conn.execute(
            `insert into ${config.env}.product_media (uuid,product_id,media_url,priority) 
        values('${element.uid}','${req.id}','${element.name}','${element.priority}')`
          );
        });
      }

      //////////////// end product images/////////////////

      //////////////// insert default image/////////////////
      // added product_id as well to encorporate duplicate product feature
      await conn.execute(
        `update ${config.env}.product_media set default_image=1 where uuid='${req.defaultImage}' and product_id = ${req.id}`
      );
      //////////////// end default image/////////////////
      //////////////// insert certificate data/////////////////
      if (req.certificatestatus && req.certificate.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_certificate where product_id='${req.id}'`
        );

        req.certificate.forEach(async (element) => {
          await conn.execute(
            `insert into ${
              config.env
            }.product_certificate(product_id,uuid,certificate_name,certificate_image) values('${
              req.id
            }','${UUIDV4()}','${element.CertificateName}','${
              element.CertificateImage
            }')`
          );
        });
      }
      //////////////// end certificate data/////////////////
      //////////////// insert document data/////////////////
      if (req.documentstatus && req.document.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_document where product_id='${req.id}'`
        );

        req.document.forEach(async (element) => {
          await conn.execute(
            `insert into ${
              config.env
            }.product_document(product_id,uuid,document_name,document_image) values('${
              req.id
            }','${UUIDV4()}','${element.DocumentName}','${
              element.DocumentImage
            }')`
          );
        });
      }
      //////////////// end document data/////////////////
      //////////////// update price data/////////////////
      if (req.pricestatus && req.pricejson.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_price where product_id='${req.id}'`
        );

        req.pricejson.forEach(async (element) => {
          console.log(
            `insert into ${
              config.env
            }.product_price(product_id,uuid,product_price,product_quantity,sparky_id,manufacturer_id) values('${
              req.id
            }','${UUIDV4()}','${element.price}','${element.quantity}','${
              req.sparky_id
            }','${req.manufacturer_id}')`
          );
          await conn.execute(
            `insert into ${
              config.env
            }.product_price(product_id,uuid,product_price,product_quantity,sparky_id) values('${
              req.id
            }','${UUIDV4()}','${element.price}','${element.quantity}','${
              req.sparky_id
            }')`
          );
        });
      }
      //////////////// end price data/////////////////

      //////////////// update price data/////////////////
      if (req.final_section_save && req.final_section_save.length > 0) {
        await conn.execute(
          `delete from ${config.env}.product_tag_map where product_id='${req.id}'`
        );

        req.final_section_save.forEach(async (element) => {
          console.log(
            `insert into ${config.env}.product_tag_map(product_id,tag_id,order_no) values('${req.id}','${element.section_id}','${element.section_number_id}')`
          );
          await conn.execute(
            `insert into ${config.env}.product_tag_map(product_id,tag_id,order_no) values('${req.id}','${element.section_id}','${element.section_number_id}')`
          );
        });
      }
      //////////////// end price data/////////////////

      conn.end();
      return [];
    }
  } catch (e) {
    console.log("update Product Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const GetProductTableData = async (req) => {
  console.log("In Get Product Table Data :::::::::::::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    if (req.filter == 2 && !req.keyword) {
      // removing limit for filters to work
      /*
      const [results] = await conn.execute(
        `select
      pp.id, pp.name,pp.status,
      pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id order by pp.id DESC LIMIT ${pagefrom}, ${req.pageSize}`
      );
      */
      if ((req.type = "preassemblesProduct")) {
        const [results] = await conn.execute(
          `select
        pp.id, pp.name,pp.sparky_id,pp.isDuplicate,pp.position,pp.slug,pp.status,
        pp.price, cc.name as parent_category,cc.title,
    pm.media_url  as product_media_default  from  ${config.env}.product as pp left join ${config.env}.product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
    left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id order by pp.position ASC`
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select
    pp.id, pp.name,pp.sparky_id,pp.isDuplicate,pp.position,pp.slug,pp.status,
    pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  ${config.env}.product as pp left join ${config.env}.product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id order by pp.id DESC`
        );
        conn.end();
        return results;
      }
    } else if (req.keyword) {
      const keywordSearch = "'%" + req.keyword + "%'";
      // removing limit for filters to work
      /*
      const [results] = await conn.execute(
        `select
      pp.id, pp.name,pp.status,
      pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id where pp.name like  ${keywordSearch} order by pp.id DESC  LIMIT ${pagefrom}, ${req.pageSize}`
      );
*/

      console.log(`select
pp.id, pp.name,pp.sparky_id,pp.isDuplicate,pp.position,pp.slug,pp.status,
pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id where pp.name like  ${keywordSearch} OR pp.sparky_id like ${keywordSearch} order by pp.id DESC`);

      const [results] = await conn.execute(
        `select
pp.id, pp.name,pp.sparky_id,pp.isDuplicate,pp.position,pp.slug,pp.status,
pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id where pp.name like  ${keywordSearch} OR pp.sparky_id like ${keywordSearch} order by pp.id DESC`
      );
      conn.end();
      return results;
    } else {
      // removing limit for filters to work
      /*
      const [results] = await conn.execute(
        `select
      pp.id, pp.name,pp.status,
      pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id where  pp.status=${req.filter} order by pp.id DESC LIMIT ${pagefrom}, ${req.pageSize}`
      );
      */
      const [results] = await conn.execute(
        `select
pp.id, pp.name,pp.sparky_id,pp.isDuplicate,pp.position,pp.slug,pp.status,
pp.price, cc.name as parent_category,cc.title,
pm.media_url  as product_media_default  from  product as pp left join product_media as pm on pm.product_id = pp.id and pm.default_image = '1'
left join product_category pc on pc.product_id=pp.id left join category cc on cc.id= pc.category_id where  pp.status=${req.filter} order by pp.id DESC`
      );
      conn.end();
      return results;
    }
  } catch (e) {
    console.log("Get Product Table Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const GetProductDetailData = async (req) => {
  console.log("GetProductDetailData req =", req);
  ``;
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    console.log(`select
    pp.isDuplicate,pp.qty_per_pack,pp.qty_type,sm.stock,pp.id, name, pp.position,slug,pp.product_type,pp.status,pp.pallets,pp.weight,pp.length,pp.breadth,pp.height,pp.cbm,product_key_features,description, price,
    meta_description, meta_keyword, additional_attributes, pp.sparky_id, pp.manufacturer_id,pp.cable_pricing_permeter ,pp.terminal_1_id , pp.terminal_2_id ,pp.custmFilterNumber1,pp.custmFilterNumber2,pp.custmFilterNumber3,pp.custmFilterNumber4,pp.custmFilterNumber5,pp.custmFilterNumber6,pp.custmFilterNumber7,pp.custmFilterNumber8,pp.custmFilterNumber9,pp.custmFilterNumber10,
(select media_url from product_media as pm where pm.product_id = pp.id and pm.default_image = '1' ) as selected_default_image,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultimage', default_image, 'priority', priority, 'uuid', uuid)) from product_media as pm where pm.product_id = pp.id) product_media,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pp.id) category_hierarchy,
( SELECT JSON_ARRAYAGG(JSON_OBJECT('id', convert(uuid, CHAR), 'product_id', convert(pp.uuid, CHAR), 'star_rating', star_rating,'display_name', convert(display_name, CHAR), 'email_address', convert(email_address, CHAR), 
 'title', convert(title, CHAR), 'feedback', convert(feedback, CHAR), 'image', convert(image, CHAR), 'feedback_status', feedback_status, 'image_status', image_status)) from customer_review as cr  where cr.product_id = pp.id and cr.approved=1 and archive=0)  product_reviews

,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',c.name,'id',c.id)) FROM product_category as pc left outer join category as c  
on pc.category_id=c.id
where pc.product_id=pp.id) as categorybytag
,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',p.name,'id',p.id)) FROM product_bought_together as pbt left outer join product as p  
on pbt.sub_product_id=p.id where pbt.product_id=pp.id) as relatedproducttag
,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',p.name,'id',p.id)) FROM product_alternative_together as pat left outer join product as p  
on pat.sub_product_id=p.id where pat.product_id=pp.id) as alternativeproducttag
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('CertificateName',certificate_name,'CertificateImage',certificate_image,'UploadStatus',upload_status)) from product_certificate as pc where pc.product_id = pp.id) product_certificate
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('DocumentName',document_name,'DocumentImage',document_image,'UploadStatus',upload_status)) from product_document as pd where pd.product_id = pp.id) product_document
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pp.id) product_price

    from  
${config.env}.product as pp left JOIN stock_master sm ON pp.sparky_id=sm.sparky_id 
left join product_category pc on pp.id = pc.product_id left join subcat_product_filter_master pfm on pfm.subCatId = pc.category_id
where pp.id=${req.product_id} LIMIT 1`);

    const [results] = await conn.execute(
      `select
      pp.isDuplicate,pp.qty_per_pack,pp.qty_type,sm.stock,pp.id, name, pp.position,slug,pp.product_type,pp.status,pp.pallets,pp.weight,pp.length,pp.breadth,pp.height,pp.cbm,product_key_features,description, price,
      meta_description, meta_keyword, additional_attributes, pp.sparky_id, pp.manufacturer_id,pp.cable_pricing_permeter ,pp.terminal_1_id , pp.terminal_2_id ,   pp.custmFilterNumber1,pp.custmFilterNumber2,pp.custmFilterNumber3,pp.custmFilterNumber4,pp.custmFilterNumber5,pp.custmFilterNumber6,pp.custmFilterNumber7,pp.custmFilterNumber8,pp.custmFilterNumber9,pp.custmFilterNumber10,
(select media_url from product_media as pm where pm.product_id = pp.id and pm.default_image = '1' ) as selected_default_image,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultimage', default_image, 'priority', priority, 'uuid', uuid)) from product_media as pm where pm.product_id = pp.id) product_media,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pp.id) category_hierarchy,
 ( SELECT JSON_ARRAYAGG(JSON_OBJECT('id', convert(uuid, CHAR), 'product_id', convert(pp.uuid, CHAR), 'star_rating', star_rating,'display_name', convert(display_name, CHAR), 'email_address', convert(email_address, CHAR), 
   'title', convert(title, CHAR), 'feedback', convert(feedback, CHAR), 'image', convert(image, CHAR), 'feedback_status', feedback_status, 'image_status', image_status)) from customer_review as cr  where cr.product_id = pp.id and cr.approved=1 and archive=0)  product_reviews

,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',c.name,'id',c.id)) FROM product_category as pc left outer join category as c  
on pc.category_id=c.id
 where pc.product_id=pp.id) as categorybytag
 ,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',p.name,'id',p.id)) FROM product_bought_together as pbt left outer join product as p  
on pbt.sub_product_id=p.id where pbt.product_id=pp.id) as relatedproducttag
  ,( SELECT JSON_ARRAYAGG(JSON_OBJECT('name',p.name,'id',p.id)) FROM product_alternative_together as pat left outer join product as p  
on pat.sub_product_id=p.id where pat.product_id=pp.id) as alternativeproducttag
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('CertificateName',certificate_name,'CertificateImage',certificate_image,'UploadStatus',upload_status)) from product_certificate as pc where pc.product_id = pp.id) product_certificate
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('DocumentName',document_name,'DocumentImage',document_image,'UploadStatus',upload_status)) from product_document as pd where pd.product_id = pp.id) product_document
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pp.id) product_price
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('tag_id',CAST(tag_id AS UNSIGNED),'tag_name',tag_name ,'order_no',order_no)) from product_tag_map ptm 
join tag_master tm on ptm.tag_id = tm.id
where pp.id = ptm.product_id) product_tags

      from  
 ${config.env}.product as pp left JOIN stock_master sm ON pp.sparky_id=sm.sparky_id 
 left join product_category pc on pp.id = pc.product_id left join subcat_product_filter_master pfm on pfm.subCatId = pc.category_id
 where pp.id=${req.product_id} LIMIT 1`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("Get Product Detail Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const GetProductTableCount = async (req) => {
  console.log("GetProductTableCount", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    if (req.filter == 2 && !req.keyword) {
      const [results] = await conn.execute(
        `select count(1) as total  from  ${config.env}.product as pp`
      );

      conn.end();
      return results;
    } else if (req.keyword) {
      const keywordSearch = "'%" + req.keyword + "%'";
      const [results] = await conn.execute(
        `select count(1) as total  from  ${config.env}.product as pp where name like  ${keywordSearch}  or id like  ${keywordSearch} `
      );

      conn.end();
      return results;
    } else {
      const [results] = await conn.execute(
        `select
count(1) as total from  ${config.env}.product as pp where  pp.status=${req.filter}`
      );
      conn.end();
      return results;
    }
  } catch (e) {
    console.log("Get Product Table Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const deleteProductData = async (req) => {
  console.log("delete Product Data ::::", req);
  let conn = "";
  try {
    const reqLikeObject = {
      body: { type: "productimages", new_file: "", subType: "" },
    };
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [productMediaURLList] = await conn.query(
      `select media_url from ${config.env}.product_media where product_id='${req.id}'`
    );
    console.log("productMediaURLList", productMediaURLList);
    const [productCertificateURLList] = await conn.query(
      `select certificate_image from ${config.env}.product_certificate where product_id='${req.id}'`
    );
    console.log("productCertificateURLList", productCertificateURLList);
    const [productDocumentURLList] = await conn.query(
      `select document_image from ${config.env}.product_document where product_id='${req.id}'`
    );
    console.log("productDocumentURLList", productDocumentURLList);

    // return;
    await conn.query(`delete from ${config.env}.product where id='${req.id}'`);
    await conn.execute(
      `delete from ${config.env}.product_category where product_id='${req.id}'`
    );

    await conn.execute(
      `delete from ${config.env}.product_bought_together where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.product_alternative_together where product_id='${req.id}'`
    );
    // DELETE product images  FROM BUCKET ALSO
    productMediaURLList.forEach((item) => {
      reqLikeObject.body.new_file = item.media_url;
      deleteUploadImage(reqLikeObject);
    });
    await conn.execute(
      `delete from ${config.env}.product_media where product_id='${req.id}'`
    );
    // DELETE product certificate images  FROM BUCKET ALSO
    productCertificateURLList.forEach((item) => {
      reqLikeObject.body.subType = "certificateimages";
      reqLikeObject.body.new_file = item.certificate_image;
      deleteUploadImage(reqLikeObject);
    });
    await conn.execute(
      `delete from ${config.env}.product_certificate where product_id='${req.id}'`
    );
    // DELETE product document images  FROM BUCKET ALSO
    productDocumentURLList.forEach((item) => {
      reqLikeObject.body.subType = "documentimages";
      reqLikeObject.body.new_file = item.document_image;
      deleteUploadImage(reqLikeObject);
    });
    await conn.execute(
      `delete from ${config.env}.product_document where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.product_price where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.industries_product_mapping where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.brands_product_mapping where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.stock_master where product_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.product_tag_map where product_id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const saveMainBanner = async (req) => {
  let conn = "";

  try {
    console.log("!!!!!!!!!!!! saveMainBanner SERVICE req =", req);
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // await conn.execute(`SET SQL_MODE='ALLOW_INVALID_DATES';`);
    const [result] = await conn.execute(
      `insert into ${config.env}.main_banner
      (uuid,status,title,position,image,from_date,to_date)
        values('${UUIDV4()}',${req.status},'${req.title}','${req.priority}','${
        req.image_url
      }','${req.from_date}','${req.to_date}')`
    );

    console.log("!!!!!!!!!!!!!!222222222 result = ", result);
    conn.end();
    return result;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateMainBanner = async (req) => {
  let conn = "";
  try {
    console.log("!!!!!!!!!!!! updateMainBanner SERVICE req =", req);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    await conn.execute(
      `update ${config.env}.main_banner set 
        status=${req.status}
        ,title='${req.title}'
        ,position='${req.position}'
        ,image='${req.image_url}'
        ,from_date='${req.from_date}'
        ,to_date='${req.to_date}'
         where id='${req.id}'`
    );

    conn.end();

    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const getMainBannerData = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,status,title,position,image,from_date,to_date FROM ${config.env}.main_banner as b order by id DESC LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getMainBannerCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.main_banner`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getBannerData = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,status,title,image FROM ${config.env}.banner as b order by id DESC LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getBannerCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.banner`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const updateBanner = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    await conn.execute(
      `update ${config.env}.banner set 
        status=${req.status}
        ,title='${req.title}'
        ,image='${req.image_url}'
         where id='${req.id}'`
    );

    conn.end();

    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const deleteBannerData = async (req) => {
  console.log("delete Banner Data ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `delete from ${config.env}.main_banner where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const getContentData = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,page_title,page_url,page_content,status,meta_title,meta_description,meta_keyword FROM ${config.env}.content_page as b order by id DESC LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getContentCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.content_page`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const saveContentData = async (req) => {
  let content = parse(req.page_content);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.query(
      `insert into ${config.env}.content_page SET uuid = ?,page_title = ?,page_url = ?,page_content = ?,status = ?,meta_title = ?,meta_description = ?,meta_keyword = ?`,
      [
        UUIDV4(),
        req.page_title,
        req.page_url,
        content,
        req.status,
        req.meta_title,
        req.meta_description,
        req.meta_keyword,
      ]
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const deleteContentData = async (req) => {
  console.log("save product request data ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `delete from ${config.env}.content_page where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateContentData = async (req) => {
  let content = parse(req.page_content);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `UPDATE ${config.env}.content_page SET page_title = ?,page_url = ?,page_content = ?,status = ?,meta_title = ?,meta_description = ?,meta_keyword = ? WHERE id = ?`,
      [
        req.page_title,
        req.page_url,
        content,
        req.status,
        req.meta_title,
        req.meta_description,
        req.meta_keyword,
        req.id,
      ]
    );

    conn.end();
    return [];
  } catch (e) {
    //console.log("In content update Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const getFiltersAccordingToCategory = async (req) => {
  // console.log("In getFiltersAccordingToCategory ::::");
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    // const [results] = await conn.execute(
    //   `SELECT f.category_id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f inner join ${config.env}.category c on f.category_id=c.id group by category_id LIMIT ${pagefrom}, ${req.pageSize}`
    // );

    // new query for upgraded table
    const [results] = await conn.execute(
      `SELECT c.id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f right join ${config.env}.category c on f.category_id=c.id where c.level = 1
      group by c.id,c.name,c.status LIMIT ${pagefrom}, ${req.pageSize}`
    );
    // start - resolve the bug where if last page doesnt have any data, return prev page
    if (results.length == 0 && req.page > 1) {
      pagefrom =
        req.page == 1 ? 0 : req.pageSize * (req.page - 1) - req.pageSize;
      // const [results] = await conn.execute(
      //   `SELECT f.category_id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f inner join ${config.env}.category c on f.category_id=c.id group by category_id LIMIT ${pagefrom}, ${req.pageSize}`
      // );
      const [results] = await conn.execute(
        `SELECT c.id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f right join ${config.env}.category c on f.category_id=c.id where c.level = 1
        group by c.id,c.name,c.status LIMIT ${pagefrom}, ${req.pageSize}`
      );
      conn.end();
      return results;
    }
    // end
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getFiltersAccordingToCategory Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getFiltersCount = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // const [results] = await conn.execute(
    //   `SELECT c.id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f left join ${config.env}.category c on f.category_id=c.id group by c.id `
    // );

    // new query count
    const [results] = await conn.execute(
      `SELECT c.id, c.name categoryName, c.status,JSON_ARRAYAGG(JSON_OBJECT('id', f.id,'filterName',filter_name,'isLinked',(SELECT COUNT(1) FROM category_filter where filter_id=f.id))) filterJson,group_concat(filter_name) filterName from ${config.env}.filter_master f right join ${config.env}.category c on f.category_id=c.id where c.level = 1
      group by c.id,c.name,c.status`
    );
    conn.end();
    return results.length;
  } catch (error) {
    console.log("In getFiltersCount Error::::", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const addFilterWithCategory = async (req) => {
  console.log("addFilterWithCategory SERVICE req=", req);
  let conn = "";

  try {
    if (req) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      for (let i = 0; i < req.filterName.length; i++) {
        await conn.execute(
          `insert into ${config.env}.filter_master 
        (uuid,category_id,filter_name) 
          values('${UUIDV4()}', '${req.categoryId}','${
            req.filterName[i].filter_name
          }')`
        );
      } ///// end filter by category/////////////////
      conn.end();
      return (results = "Saved");
    } else {
      conn.end();
      throw new ERROR("req is empty!");
    }
  } catch (e) {
    console.log("In addFilterWithCategory Service Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateManageFilter = async (req) => {
  console.log(" SERVICE updateManageFilter ", req);
  // return;
  /*
  let filterNameArray = [];
let z = Object.keys(filterNameArray);
for(let i = 0; i < z.length; i++){
    filterNameArray.push({id:parseInt(z[i]), filterName:filterNameArray[z[i]]})
}
console.log(filterNameArray)
*/
  delete req.filterNameArray.status;
  delete req.filterNameArray.categoryName;
  let filterIdsArray = Object.keys(req.filterNameArray);
  console.log(filterIdsArray);
  let conn = "";
  try {
    if (req) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      filterIdsArray.forEach(async (element) => {
        await conn.execute(
          `UPDATE ${config.env}.filter_master SET filter_name=? WHERE id=?`,
          [req.filterNameArray[element], element]
        );
      });
      conn.end();
      return (results = "Saved");
    } else {
      conn.end();
      throw new ERROR("req is empty!");
    }
  } catch (e) {
    console.log("In addFilterWithCategory Service Error::::", e);
  }
};

const getSubCategoryTitleTableData = async (req) => {
  console.log("in getSubCategoryTitleTableData");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let { pageSize, page = 1 } = req;
    let skip = (page - 1) * pageSize;
    console.log("getSubCategoryTitleTableData", pageSize, page, skip);
    // const [results] = await conn.execute(
    //   `select st.category_id, c.name categoryName, c.status, JSON_ARRAYAGG(JSON_OBJECT('id', st.id,'subcategory_title',subcategory_title,'isLinked',(SELECT COUNT(1) FROM ${config.env}.category ic where ic.title=st.subcategory_title))) filterJson,group_concat(subcategory_title SEPARATOR '=') subcategory_title from ${config.env}.subcategory_title_master st left join ${config.env}.category c on st.category_id=c.id group by st.category_id,c.name,c.status limit ${pageSize} offset ${skip}`
    // );
    // new query to experiment upgraded table
    const [results] = await conn.execute(`
    select c.id, c.name categoryName, c.status, JSON_ARRAYAGG(JSON_OBJECT('id', st.id,'subcategory_title',subcategory_title,'isLinked',(SELECT COUNT(1) FROM category ic where ic.title=st.subcategory_title))) filterJson,group_concat(subcategory_title SEPARATOR '=') subcategory_title from subcategory_title_master st  right  join category c on st.category_id=c.id 
where c.level = 1
group by c.id,c.name,c.status limit ${pageSize} offset ${skip}`);

    conn.end();
    return results;
  } catch (e) {
    console.log("In Product Enquiry Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getSubCategoryTitleTableCount = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select c.id, c.name categoryName, c.status, JSON_ARRAYAGG(JSON_OBJECT('id', st.id,'subcategory_title',subcategory_title,'isLinked',(SELECT COUNT(1) FROM ${config.env}.category ic where ic.title=st.subcategory_title))) filterJson,group_concat(subcategory_title SEPARATOR '=') subcategory_title from ${config.env}.subcategory_title_master st right join ${config.env}.category c on st.category_id=c.id where c.level = 1 group by c.id,c.name,c.status`
    );

    conn.end();
    return results.length;
  } catch (e) {
    console.log("get SubCategory Title Table Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const updateManageSubcategoryTitle = async (req) => {
  console.log(" SERVICE updateManageSubcategoryTitle ", req);
  // return;
  /*
  let filterNameArray = [];
let z = Object.keys(filterNameArray);
for(let i = 0; i < z.length; i++){
    filterNameArray.push({id:parseInt(z[i]), filterName:filterNameArray[z[i]]})
}
console.log(filterNameArray)
*/
  delete req.filterNameArray.status;
  delete req.filterNameArray.categoryName;
  let filterIdsArray = Object.keys(req.filterNameArray);
  console.log(filterIdsArray);
  let conn = "";
  // var connTwo = "";
  try {
    // conn = await mysql.createConnection(config.mysqlDBConfig);
    // connTwo = await mysql.createConnection(config.mysqlDBConfig);
    // connThree = await mysql.createConnection(config.mysqlDBConfig);
    // await connTwo.execute(`SET SQL_SAFE_UPDATES = 0;`);
    if (req) {
      filterIdsArray.forEach(async (element) => {
        // to  update title in category table
        conn = await mysql.createConnection(config.mysqlDBConfig);
        await conn.execute(`SET SQL_SAFE_UPDATES = 0;`);
        const [resultFromQuery] = await conn.execute(
          `SELECT * FROM ${config.env}.subcategory_title_master where id = ?`,
          [element]
        );
        console.log("^^^^^^^^^^ resultFromQuery", resultFromQuery[0]);
        await conn.execute(
          `UPDATE ${config.env}.category SET title=? WHERE title=?`,
          [req.filterNameArray[element], resultFromQuery[0].subcategory_title]
        );
        // connTwo.end();
        // to update title in subcategory_title_master
        // conn = await mysql.createConnection(config.mysqlDBConfig);
        // await conn.execute(
        await conn.execute(
          `UPDATE ${config.env}.subcategory_title_master SET subcategory_title=? WHERE id=?`,
          [req.filterNameArray[element], element]
        );
        // conn.end();
      });
      // conn.end();
      // connTwo.end();
      return (results = "Saved");
    } else {
      // conn.end();
      // connTwo.end();
      throw new ERROR("req is empty!");
    }
  } catch (e) {
    console.log("In addFilterWithCategory Service Error::::", e);
  } finally {
    // conn.end();
    // connTwo.end();
    // connThree.end();
  }
};

const deleteSubcategoryTitle = async (req) => {
  console.log("delete deleteSubcategoryTitle SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `delete from ${config.env}.subcategory_title_master where id='${req.id}'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteSubcategoryTitle :${e}`
    );
  }
};

const saveSubcategoryTitle = async (req) => {
  let conn = "";
  console.log("saveSubcategoryTitle SERVICE", req);
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `insert into ${config.env}.subcategory_title_master SET category_id = ?,subcategory_title = ?,uuid = ?`,
      [req.category_id, req.title, UUIDV4()]
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("save Subcategory Title Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateProductStockByExcel = async (req) => {
  const resJson = {
    totalItems: 0,
    totalInsert: 0,
    totalUpdated: 0,
    message: "",
  };
  let conn;

  try {
    // Validate Excel Headers
    const element = req[0];
    const elementFirst = req[1];
    let isValidExcel = element && elementFirst && 
      element[0] === "Sparky ID" &&
      element[1] === "Manf ID" &&
      element[2] === "Qty in Stock" &&
      element[3] === "Pricings" &&
      element[9] === "Pallets" &&
      element[10] === "Weight" &&
      elementFirst[3] === "Qty 1" &&
      elementFirst[4] === "AUD$";

    if (!isValidExcel) {
      resJson.message = "Invalid Excel Format! Please check the column header names again.";
      return resJson;
    }

    conn = await mysql.createConnection(config.mysqlDBConfig);

    resJson.totalItems = req.length - 2;
    for (let index = 2; index < req.length; index++) {
      const element = req[index];
      if (!element || element.length < 16) {
        console.error(`Invalid row at index ${index}:`, element);
        continue;
      }

      console.log("Processing row:", element);

      // Safeguard .slice usage
      const pricing1Qty = element[3] && typeof element[3] === "string" ? element[3].slice(0, -1) : element[3];
      const pricing1Price = element[4] && typeof element[4] === "string" ? element[4].slice(1) : element[4];
      const pricing2Qty = element[5] && typeof element[5] === "string" ? element[5].slice(0, -1) : element[5];
      const pricing2Price = element[6] && typeof element[6] === "string" ? element[6].slice(1) : element[6];
      const pricing3Qty = element[7] && typeof element[7] === "string" ? element[7].slice(0, -1) : element[7];
      const pricing3Price = element[8] && typeof element[8] === "string" ? element[8].slice(1) : element[8];

      const [isExistsData] = await conn.execute(
        `SELECT COUNT(1) AS tot FROM ${config.env}.stock_master WHERE sparky_id = ? AND status = '1'`,
        [element[0]]
      );

      if (isExistsData[0].tot === 0) {
        // Product does not exist
        console.warn(`Product with Sparky ID ${element[0]} not found in stock_master.`);
        continue;
      } else {
        // Update existing product
        await conn.query(
          `UPDATE ${config.env}.product SET qty_per_pack = ? WHERE sparky_id = ?`,
          [element[15], element[0]]
        );
        await conn.query(
          `UPDATE ${config.env}.stock_master SET stock = ? WHERE sparky_id = ?`,
          [element[2], element[0]]
        );
        resJson.totalUpdated++;

        const [numRecords] = await conn.execute(
          `SELECT uuid FROM ${config.env}.product_price WHERE sparky_id = ?`,
          [element[0]]
        );

        for (let i = 0; i < numRecords.length; i++) {
          const qty = i === 0 ? pricing1Qty : i === 1 ? pricing2Qty : pricing3Qty;
          const price = i === 0 ? pricing1Price : i === 1 ? pricing2Price : pricing3Price;

          await conn.query(
            `UPDATE ${config.env}.product_price SET product_quantity = ?, product_price = ? WHERE sparky_id = ? AND uuid = ?`,
            [qty, price, element[0], numRecords[i].uuid]
          );
        }

        await conn.query(
          `UPDATE ${config.env}.product SET pallets = ?, weight = ?, length = ?, breadth = ?, height = ?, cbm = ? WHERE sparky_id = ?`,
          [
            element[9],
            element[10],
            element[11],
            element[12],
            element[13],
            element[14],
            element[0],
          ]
        );
      }
    }

    if (resJson.totalItems > 0) {
      await conn.query(
        `INSERT INTO ${config.env}.stock_upload_log (uuid, total_item, total_insert, total_update) VALUES (?, ?, ?, ?)`,
        [
          UUIDV4(),
          resJson.totalItems,
          resJson.totalInsert,
          resJson.totalUpdated,
        ]
      );
      resJson.message = "Data uploaded!";
    } else {
      resJson.message = "Something went wrong!";
    }

    return resJson;
  } catch (e) {
    console.error("Error during Excel upload processing:", e);
    resJson.message = "An error occurred during processing.";
    return resJson;
  } finally {
    if (conn) conn.end();
  }
};

// Backup previos code for the upload stock product
// const updateProductStockByExcel = async (req) => {
//   console.log("^^^^^^^^^^^^^^^ updateProductStockByExcel SERVICE req = ", req);
//   // return;
//   // let arr = [];
//   // let obj = {};
//   // for (let i = 2; i < req.length; i++) {
//   //   obj.req[0][0] = req[i][0];
//   //   obj.req[0][0] = req[i][0];
//   //   obj.req[0][0] = req[i][0];
//   //   obj.req[0][0] = req[i][0];
//   //   arr.push[obj]
//   // }
//   const resJson = {
//     totalItems: 0,
//     totalInsert: 0,
//     totalUpdated: 0,
//     message: "",
//   };
//   let conn = "";
//   // check if excel col headings are correct
//   const element = req[0];
//   const elementFirst = req[1];
//   let isValidExcel = false;
//   console.log("element in format check element = ", element);
//   console.log("elementFirst in format check elementFirst = ", elementFirst);
//   if (
//     element[0] == "Sparky ID" &&
//     element[1] == "Manf ID" &&
//     element[2] == "Qty in Stock" &&
//     element[3] == "Pricings" &&
//     element[4] == null &&
//     element[5] == null &&
//     element[6] == null &&
//     element[7] == null &&
//     element[8] == null &&
//     element[9] == "Pallets" &&
//     element[10] == "Weight" &&
//     element[11] == "Length" &&
//     element[12] == "Breadth" &&
//     element[13] == "Height" &&
//     element[14] == "CBM" &&
//     element[15] == "Qty per Pack" &&
//     elementFirst[0] == null &&
//     elementFirst[1] == null &&
//     elementFirst[2] == null &&
//     elementFirst[3] == "Qty 1" &&
//     elementFirst[4] == "AUD$" &&
//     elementFirst[5] == "Qty 2" &&
//     elementFirst[6] == "AUD$" &&
//     elementFirst[7] == "Qty 3" &&
//     elementFirst[8] == "AUD$" &&
//     elementFirst[9] == null &&
//     elementFirst[10] == null &&
//     elementFirst[11] == null &&
//     elementFirst[12] == null &&
//     elementFirst[13] == null &&
//     elementFirst[14] == null &&
//     elementFirst[15] == null
//   ) {
//     isValidExcel = true;
//   }
//   if (isValidExcel == false) {
//     resJson.message =
//       "Invalid Excel Format! Please check the column header names again";
//     return resJson;
//   }
//   try {
//     conn = await mysql.createConnection(config.mysqlDBConfig);

//     resJson.totalItems = req.length - 2;
//     for (let index = 2; index < req.length; index++) {
//       const element = req[index];
//       console.log("eeeeeeeeeeeeeeeeeeeeeeeee element", element);
//       const [isExistsData] = await conn.execute(
//         `select count(1) as tot  from  ${config.env}.stock_master where sparky_id='${element[0]}' and status ='1' `
//       );
//       console.log(
//         " !!!!!!!!!!!!!!!!! isExistsData[0].tot",
//         isExistsData[0].tot
//       );
//       if (isExistsData[0].tot == 0) {
//         // Do nothing if product does not exist
//         /*
//         await conn.query(
//           `insert into ${config.env}.stock_master (uid,sparky_id,manufacturer_id,stock,status ) values(?,?,?,?,?)`,
//           [UUIDV4(), element[0], element[1], element[2], 1]
//         );
//         resJson.totalInsert = parseInt(resJson.totalInsert) + 1;
//         await conn.query(
//           `insert into ${config.env}.product_price (uid,sparky_id,manufacturer_id,product_quantity,product_price ) values(?,?,?,?,?)`,
//           [
//             UUIDV4(),
//             element[0],
//             element[1],
//             element[3].slice(0, -1),
//             element[4].slice(1),
//           ]
//         );
//         await conn.query(
//           `insert into ${config.env}.product_price (uid,sparky_id,manufacturer_id,product_quantity,product_price ) values(?,?,?,?,?)`,
//           [
//             UUIDV4(),
//             element[0],
//             element[1],
//             element[5].slice(0, -1),
//             element[6].slice(1),
//           ]
//         );
//         await conn.query(
//           `insert into ${config.env}.product_price (uid,sparky_id,manufacturer_id,product_quantity,product_price ) values(?,?,?,?,?)`,
//           [
//             UUIDV4(),
//             element[0],
//             element[1],
//             element[7].slice(0, -1),
//             element[8].slice(1),
//           ]
//         );
//         */
//       } else {
//         console.log("type of element[15]", typeof element[15]);
//         await conn.query(
//           `update ${config.env}.product set qty_per_pack=? where sparky_id=?`,
//           [element[15], element[0]]
//         );
//         await conn.query(
//           `update ${config.env}.stock_master set stock=? where sparky_id=?`,
//           [element[2], element[0]]
//         );
//         resJson.totalUpdated = parseInt(resJson.totalUpdated) + 1;
//         const [numRecords] = await conn.execute(
//           `select uuid from ${config.env}.product_price where sparky_id=?`,
//           [element[0]]
//         );
//         console.log("&&&&&&&&&&&&&&&&&&&&&&&&& numRecords", numRecords);
//         const [numRecordsID] = await conn.execute(
//           `select product_id from ${config.env}.product_price where sparky_id=?`,
//           [element[0]]
//         );
//         console.log("&&&&&&&&&&&&&&&&&&&&&&&&& numRecordsID", numRecordsID);
//         await conn.query(
//           `update ${config.env}.product_price set product_quantity=?,product_price=? where sparky_id=? and uuid=?`,
//           [
//             element[3].slice(0, -1),
//             // element[4].slice(1), // REMOVE $
//             element[4],
//             element[0],
//             numRecords[0].uuid,
//           ]
//         );
//         await conn.query(
//           `update ${config.env}.product_price set product_quantity=?,product_price=? where sparky_id=? and uuid=?`,
//           [
//             element[5].slice(0, -1),
//             // element[6].slice(1), // REMOVE $
//             element[6],
//             element[0],
//             numRecords[1].uuid,
//           ]
//         );
//         await conn.query(
//           `update ${config.env}.product_price set product_quantity=?,product_price=? where sparky_id=? and uuid=?`,
//           [
//             element[7].slice(0, -1),
//             // element[8].slice(1), // REMOVE $
//             element[8],
//             element[0],
//             numRecords[2].uuid,
//           ]
//         );
//         await conn.query(
//           `update ${config.env}.product set pallets=?,weight=?,length=?,breadth=?,height=?,cbm=? where sparky_id=?`,
//           [
//             element[9],
//             element[10],
//             element[11],
//             element[12],
//             element[13],
//             element[14],
//             element[0],
//           ]
//         );
//       }
//     }

//     if (resJson.totalItems && resJson.totalItems > 0) {
//       await conn.query(
//         `insert into ${config.env}.stock_upload_log (uuid,total_item,total_insert,total_update) values(?,?,?,?)`,
//         [
//           UUIDV4(),
//           resJson.totalItems,
//           resJson.totalInsert,
//           resJson.totalUpdated,
//         ]
//       );

//       resJson.message = "Data upload!";
//     } else {
//       resJson.message = "Something went wrong!!";
//     }

//     return resJson;
//   } catch (e) {
//     console.log("save Subcategory Title Error::::", e);
//     conn.end();
//     return resJson;
//   } finally {
//     conn.end();
//   }
// };


// old
// const updateProductStockByExcel = async (req) => {
//   console.log("^^^^^^^^^^^^^^^ updateProductStockByExcel SERVICE req = ", req);

//   const resJson = {
//     totalItems: 0,
//     totalInsert: 0,
//     totalUpdated: 0,
//     message: "",
//   };
//   let conn = "";
//   try {
//     conn = await mysql.createConnection(config.mysqlDBConfig);

//     resJson.totalItems = req.length - 1;
//     for (let index = 1; index < req.length; index++) {
//       const element = req[index];

//       const [isExistsData] = await conn.execute(
//         `select count(1) as tot  from  ${config.env}.stock_master where product_id='${element[1]}' and status ='1' `
//       );

//       if (isExistsData[0].tot == 0) {
//         await conn.query(
//           `insert into ${config.env}.stock_master (product_id,product_code,uid,stock,status ) values(?,?,?,?,?)`,
//           [element[1], element[0], UUIDV4(), element[2], 1]
//         );
//         resJson.totalInsert = parseInt(resJson.totalInsert) + 1;
//       } else {
//         await conn.query(
//           `update ${config.env}.stock_master set stock=? where product_code=?`,
//           [element[2], element[0]]
//         );
//         resJson.totalUpdated = parseInt(resJson.totalUpdated) + 1;
//       }
//     }

//     if (resJson.totalItems && resJson.totalItems > 0) {
//       await conn.query(
//         `insert into ${config.env}.stock_upload_log (uuid,total_item,total_insert,total_update) values(?,?,?,?)`,
//         [
//           UUIDV4(),
//           resJson.totalItems,
//           resJson.totalInsert,
//           resJson.totalUpdated,
//         ]
//       );

//       resJson.message = "Data upload!";
//     } else {
//       resJson.message = "Something went wrong!!";
//     }

//     return resJson;
//   } catch (e) {
//     console.log("save Subcategory Title Error::::", e);
//     conn.end();
//     return resJson;
//   } finally {
//     conn.end();
//   }
// };

const getStockTable = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    let query = `SELECT id,total_item,total_insert,total_update,
    date_format(timestamp,'%d-%M-%Y %r') as date  FROM  ${config.env}.stock_upload_log  as sm `;

    query += ` order by id  desc LIMIT ${pagefrom}, ${req.pageSize} `;

    const [results] = await conn.execute(query);

    conn.end();
    return results;
  } catch (e) {
    console.log("In Stock Error::::", e);

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  } finally {
    conn.end();
  }
};

const getOrdersList = async () => {
  // console.log("getOrdersData SERVICE");
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // const [results] = await conn.execute(
    //   `SELECT id,externalReference, totalAmount, createdDate, erpNumber,status from  ${config.env}.orders order by createdDate DESC`
    // );
    const [results] = await conn.execute(
      `SELECT id,externalReference, totalAmount,grandTotal, date_format(createdDate,'%d-%M-%Y %r') as createdDate, erpNumber,status,delivery_instructions,shippingOption from  ${config.env}.orders order by createdAt DESC`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getOrdersList Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getOrdersListCount = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.orders`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("get Orders List Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getOrderDetails = async (req) => {
  // console.log("getOrderDetails SERVICE req==============>", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `SELECT o.*, c.deliveryAddressStreet, c.deliveryAddressSuburb, c.deliveryAddressState, c.deliveryAddressCountry , c.deliveryAddressPostcode, c.billingAddressStreet, v.voucherName FROM ${config.env}.orders o LEFT JOIN ${config.env}.customers c ON o.id = c.id LEFT JOIN ${config.env}.email_vouchers v on v.id=o.voucherId  WHERE o.id = '${req.orderId}'`
    );
    // console.log("RESULTS!!!!!!!!!!!!!!!", results);
    const [secondResults] = await conn.execute(
      `select l.*, p.name,p.pallets,p.weight,p.length,p.breadth,p.height,p.cbm, sm.stock
      from ${config.env}.lineitems l LEFT JOIN ${config.env}.product p ON l.productSimpleID = p.id 
      LEFT JOIN ${config.env}.stock_master sm ON l.productSimpleID = sm.product_id
      WHERE l.orderID = '${req.orderId}'`
    );
    // console.log("SECOND RESULTS!!!!!!!!!!!!!!!", secondResults);
    results.push(secondResults);
    const [thirdResults] = await conn.execute(
      `select p.method from ${config.env}.orderpayments p WHERE p.orderID = '${req.orderId}'`
    );
    results.push(thirdResults);
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getOrderDetails Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getUserTableData = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,email,first_name,last_name,phone,status,loginstatus,state,companyname,companyabn,segment,industry,description
      FROM ${config.env}.user order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("get User Table Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getUserTableCount = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.user`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("get User Table Count Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const updateActiveUser = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `update ${config.env}.user set status = 1 where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateInactiveUser = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `update ${config.env}.user set loginstatus = 0, status = 0 where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const saveOrdersLogs = async (req) => {
  console.log(" SERVICE saveOrdersLogs ", req);
  let conn = "";
  try {
    if (req) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      await conn.execute(`SET SQL_SAFE_UPDATES = 0;`);
      await conn.execute(
        `INSERT INTO ${config.env}.orders_logs (orderId,
        externalReference,
        userName,
        status,
        comment,
        isNotifyCustomer,
        isVisibleFrontend,
        trackingNumber,item_details) VALUES ('${req.orderId}','${
          req.externalReference
        }','${req.userName}','${req.status}','${req.comment}','${
          req.isNotifyCustomer
        }','${req.isVisibleFrontend}','${req.trackingNumber}','${JSON.stringify(
          req.itemDetails
        )}')`
      );
      await conn.execute(
        `update ${config.env}.orders set status=?, trackingNumber=? where id =?`,
        [req.status, req.trackingNumber, req.orderId]
      );
      for (let i = 0; i < req.itemDetails.length; i++) {
        // START => COMMENTING THIS AS qtyShipped should always be 0
        // await conn.execute(
        //   `update ${config.env}.lineitems SET qtyShipped =? where id =?`,
        //   [req.itemDetails[i].qtyShipped, req.itemDetails[i].id]
        // );
        // END => COMMENTING THIS AS qtyShipped should always be 0
        await conn.execute(
          `update ${config.env}.lineitems SET qtyAlreadyShipped = qtyAlreadyShipped + ? where id =?`,
          [req.itemDetails[i].qtyShipped, req.itemDetails[i].id]
        );
        await conn.execute(`SET SQL_SAFE_UPDATES=0;`);
        await conn.execute(
          `update ${config.env}.stock_master SET stock = stock - ? where product_id =?`,
          [req.itemDetails[i].qtyShipped, req.itemDetails[i].productID]
        );
      }
      conn.end();
      return (results = "Saved");
    } else {
      conn.end();
      throw new ERROR("req is empty!");
    }
  } catch (e) {
    console.log("In saveOrdersLogs Service Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const getOrderLogs = async (req) => {
  console.log("getOrderLogs SERVICE req==============>", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.orders_logs WHERE orderId = '${req.orderId}' ORDER BY createdAt DESC`
    );
    // console.log("RESULTS!!!!!!!!!!!!!!!", results);
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getOrderLogs Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const GetProductExportData = async (req) => {
  console.log("Get Product Export Data ::::");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `SELECT id, name, slug,status,product_key_features,description,price
      FROM ${config.env}.product`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("Get Product Export Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const updateErpNumber = async (req) => {
  console.log(" SERVICE updateErpNumber ", req);
  let conn = "";
  try {
    if (req) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      // await conn.execute(`SET SQL_SAFE_UPDATES = 0;`);
      await conn.execute(
        `update ${config.env}.orders set erpNumber=? where id =?`,
        [req.erpNumber, req.orderId]
      );
      conn.end();
      return (results = "Saved");
    } else {
      conn.end();
      throw new ERROR("req is empty!");
    }
  } catch (e) {
    console.log("In updateErpNumber Service Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const getexportOrderList = async () => {
  console.log("getexportOrderList Data ::::");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    // const [results] = await conn.execute(
    //   `SELECT o.*, c.deliveryAddressStreet, c.deliveryAddressSuburb, c.deliveryAddressState, c.deliveryAddressCountry , c.deliveryAddressPostcode FROM ${config.env}.orders o LEFT JOIN ${config.env}.customers c ON o.customerID = c.id`
    // );

    // conn.end();
    // return results;
    const [results] = await conn.execute(
      `select o.externalReference as orderId,o.invoiceID, o.status,
      l.productName,
      l.quantity,
          l.itemOriginalPrice,
          l.discountAmount,
          l.discountPercentage,
          o.deliveryCharge,
          l.itemPrice,
          l.lineItemTotalPrice,
          l.promotionCode,
          l.eta,
          l.deliveryMethod,
          l.deliveryCompany,
          l.deliveryDate,
          l.pickupAddress,
          l.deliveryAddressHasLift,
          l.deliveryAddressFloor,
          l.deliveryAddressHasStairs,
          l.deliveryAddressStreet,
          l.deliveryAddressSuburb,
          l.deliveryAddressState,
          l.deliveryAddressPostcode,
          l.deliveryAddressCountry,
          l.productID,
          l.SKU,
          l.description,
          l.productImage,
          l.itemConfirmed,
          l.initiatedBy,
          l.fulfillmentSource,
          l.fulfillmentDestination,
          l.numberAllocated,
          l.numberFulfilled,
          l.numberDispatched,
          l.freightCost,
          l.createdAt,
          l.updatedAt,
          l.deletedAt,
          l.deliveryReference,
          l.isFaulty,
          l.createdDate,
          l.cbm,
          l.weight
      from lineitems l
      join orders o on l.orderID = o.id;`
    );
    conn.end();
    return results;
  } catch (e) {
    console.log("getexportOrderList Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const getCreditMembersList = async (req) => {
  console.log("getCreditFormsList SERVICE", req);
  let conn = "";
  try {
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `SELECT ROW_Number() over (order by cm.id desc) sno,(SELECT (case cm.status when 0 then 'Pending' when 1 then 'In Process' when '2' then 'Approved'  when '3' then 'Rejected' end)) AS status_Name,(SELECT (case cm.method when 1 then 'Manual Form' when 2 then 'E-Form' end)) AS method,cm.id,cm.user_id,cm.creditLimit,u.email,cm.eForm_pdf_url,cm.file_url, cm.status, cm.created_at, u.first_name,u.last_name,(SELECT count(1) FROM credit_members_forms) as total from ${config.env}.credit_members_forms cm join ${config.env}.user u ON cm.user_id=u.id order by cm.created_at desc LIMIT ${pagefrom}, ${req.pageSize}`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getCreditFormsList Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const UpdateStatusCreditAccount = async (req) => {
  console.log("UpdateStatusCreditAccount req = ", req);
  let conn = "";
  const creditLimit = req.creditLimit ? req.creditLimit : null;
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    console.log(`update ${config.env}.credit_members_forms set 
    status=${req.status}
    ,comment='${req.comment}'
    ,creditLimit = ${creditLimit},lastUpdatedBy = ${req.updatedBy}
     where user_id='${req.id}'`);

    await conn.execute(
      `update ${config.env}.credit_members_forms set
        status=${req.status}
        ,comment='${req.comment}'
        ,creditLimit = ${creditLimit}
        ,creditBalance = ${creditLimit}
        ,lastUpdatedBy = ${req.updatedBy}
         where user_id='${req.id}'`
    );

    // insert for logs
    await conn.execute(
      `INSERT INTO credit_members_forms_logs (user_id, status, creditLimit,comment,updatedBy)
      VALUES ('${req.id}',${req.status},${creditLimit},'${req.comment}',${req.updatedBy});`
    );

    const [results] = await conn.execute(
      `SELECT cmf.status, cmf.comment, us.email,us.first_name,us.last_name  FROM ${config.env}.credit_members_forms as cmf left join ${config.env}.user as us on us.id = cmf.user_id where cmf.user_id='${req.id}'`
    );

    conn.end();

    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const deleteSubCategory = async (req) => {
  console.log("delete deleteSubCategory SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const reqLikeObject = {
      body: {
        type: "categoryimages",
        new_file: "",
        subType: "",
      },
    };
    const [categoryMediaURLList] = await conn.execute(
      `select image_url from ${config.env}.category where id='${req.id}'`
    );
    console.log("categoryMediaURLList", categoryMediaURLList);
    // DELETE category images  FROM BUCKET ALSO
    // categoryMediaURLList.forEach((item) => {
    reqLikeObject.body.new_file = categoryMediaURLList[0].image_url;
    deleteUploadImage(reqLikeObject);
    // });
    const [results] = await conn.execute(
      `delete from ${config.env}.category where id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.category_filter where sub_cate_id='${req.id}'`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteSubCategory:${e}`
    );
  }
};

const deleteCategory = async (req) => {
  console.log("delete deleteCategory SERVICE req ::::", req);
  console.log("delete deleteCategory SERVICE req ::::222222222", req.id);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [subCats] = await conn.execute(
      `select id from ${config.env}.category where parent_id='${req.id}'`
    );
    console.log("!!!!!!!!!!!!!!! subCats", subCats);
    for (let i = 0; i < subCats.length; i++) {
      const [products] = await conn.execute(
        `select product_id from ${config.env}.product_category where category_id='${subCats[i].id}'`
      );
      console.log("!!!!!!!!!!!!!!!222222222 products", products);
      for (let j = 0; j < products.length; j++) {
        await conn.execute(
          `delete from ${config.env}.product_bought_together where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product_alternative_together where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product_media where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product_certificate where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product_document where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product_price where product_id='${products[j].product_id}'`
        );
        await conn.execute(
          `delete from ${config.env}.product where id='${products[j].product_id}'`
        );
      }
      await conn.execute(
        `delete from ${config.env}.product_category where category_id='${subCats[i].id}'`
      );
    }
    await conn.execute(
      `delete from ${config.env}.category_filter where cate_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.filter_master where category_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.subcategory_title_master where category_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.category where parent_id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.category where id='${req.id}'`
    );
    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `deleteCategory Error :${e}`
    );
  }
};

const deleteFilter = async (req) => {
  console.log("delete deleteFilter SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `delete from ${config.env}.filter_master where id='${req.id}'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteFilter :${e}`
    );
  }
};

const uploadImage = async (req) => {
  console.log("uploadImage SERVICE req=", req.body);
  try {
    // let buffer = Buffer.from(arraybuffer);
    // let arraybuffer = Uint8Array.from(buffer).buffer;
    let file = req.files.new_file;
    let containerName = "";
    if (req.body.type == "categoryimages") {
      containerName = `categoryimages`;
    } else if (req.body.type == "bannerimages") {
      containerName = `bannerimages`;
    } else if (req.body.type == "productimages") {
      containerName = `productimages`;
    } else if (req.body.type == "brandimages") {
      containerName = `brandimages`;
    } else if (req.body.type == "industryimages") {
      containerName = `industryimages`;
    }

    console.log("@@@@@@@ containerName", containerName);
    const account = process.env.AZZURE_ACCOUNT_NAME;
    const accountKey = process.env.AZZURE_ACCOUNT_KEY;
    // Use StorageSharedKeyCredential with storage account and account key
    // StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
    const sharedKeyCredential = new StorageSharedKeyCredential(
      account,
      accountKey
    );
    const blobService = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      sharedKeyCredential
    );
    const containerClient = blobService.getContainerClient(containerName);
    await containerClient.createIfNotExists({
      access: "container",
    });

    const fileID = UUIDV4();
    const blobName = fileID + "." + file.mimetype.split("/").pop();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const options = { blobHTTPHeaders: { blobContentType: file.mimetype } };
    const uploadBlobResponse = await blockBlobClient.uploadData(
      file.data,
      options
    );
    console.log(
      `Upload block blob ${blobName} successfully`,
      uploadBlobResponse
    );
    /*
    if (uploadBlobResponse) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      const result = await conn.execute(
        `INSERT into ${config.env}.category
      (image_url,id) 
        values('${blobName}','${req.body.user_id}')`
      );
      const [resultsformail] = await conn.execute(
        `SELECT email,first_name,last_name  FROM ${config.env}.user where id='${req.body.user_id}'`
      );
      creditAccountMail({
        email: resultsformail[0].email,
        userName: `${resultsformail[0].first_name} ${resultsformail[0].last_name}`,
        comment: "",
        status: 0,
        subject: "Credit Membership Application is Pending Review",
      });
      //con}sole.log("################>>>>>>>>>>>>>>>>>>>>>>>>>>", resultsformail);
      await conn.close();
    }else{
      return
    }
    */
    return blobName;
  } catch (error) {
    console.log("In uploadImage error:", error);
    throw new ApiError(httpStatus.NOT_FOUND, "File Upload Failed!");
  }
};

const deleteUploadImage = async (req) => {
  // return;
  try {
    // let buffer = Buffer.from(arraybuffer);
    // let arraybuffer = Uint8Array.from(buffer).buffer;
    let file = req.body.new_file;
    let containerName = "";
    if (req.body.type == "categoryimages") {
      containerName = `categoryimages`;
    } else if (req.body.type == "bannerimages") {
      containerName = `bannerimages`;
    } else if (req.body.type == "productimages") {
      containerName = `productimages`;
    } else if (req.body.type == "brandimages") {
      containerName = `brandimages`;
    } else if (req.body.type == "industryimages") {
      containerName = `industryimages`;
    } else if (req.body.type == "creditfiles") {
      containerName = `creditfiles`;
    }

    console.log("deleteUploadImage SERVICE req=", req.body, containerName);

    if (containerName == "categoryimages" && req.body.category_id) {
      let conn = await mysql.createConnection(config.mysqlDBConfig);
      let query = `UPDATE ${
        config.env
      }.category SET  image_url = ${null} where id = ${req.body.category_id}`;
      console.log("query", query);
      const [results] = await conn.execute(query);
      await conn.end();
    }

    // if (
    //   containerName == "productimages" &&
    //   req.body.subType == undefined &&
    //   req.body.productId != undefined
    // ) {
    //   let conn = await mysql.createConnection(config.mysqlDBConfig);
    //   const [results] = await conn.execute(
    //     `DELETE FROM product_media where product_id='${req.body.productId}' and media_url='${req.body.new_file}'`
    //   );
    //   console.log(
    //     `DELETE FROM product_media where product_id='${req.body.productId}' and media_url='${req.body.new_file}'`
    //   );
    //   console.log(
    //     "product image deleted , id=,results=",
    //     req.body.productId,
    //     results
    //   );
    //   await conn.end();
    // }

    // start - to delete media from product_media table
    if (
      containerName == "productimages" &&
      req.body.subType == undefined &&
      req.body.productId != undefined
    ) {
      let conn = await mysql.createConnection(config.mysqlDBConfig);
      console.log(
        `DELETE FROM product_media where product_id='${req.body.productId}' and media_url='${req.body.new_file}'`
      );
      const [results] = await conn.execute(
        `DELETE FROM product_media where product_id='${req.body.productId}' and media_url='${req.body.new_file}'`
      );

      console.log(
        "product image deleted , id=,results=",
        req.body.productId,
        results
      );
      await conn.end();
      return results;
    }
    // end

    // start - to delete media from product_certificate table
    if (req.body.subType == "certificateimages") {
      let conn = await mysql.createConnection(config.mysqlDBConfig);
      const [results] = await conn.execute(
        `DELETE FROM product_certificate where certificate_image='${req.body.new_file}'`
      );
      console.log(
        `DELETE FROM product_certificate where certificate_image='${req.body.new_file}'`
      );
      // console.log(
      //   "product image deleted , id=,results=",
      //   req.body.productId,
      //   results
      // );
      await conn.end();
      return results;
    }
    // end

    // start - to delete media from product_document table
    if (req.body.subType == "documentimages") {
      let conn = await mysql.createConnection(config.mysqlDBConfig);
      const [results] = await conn.execute(
        `DELETE FROM product_document where document_image='${req.body.new_file}'`
      );
      console.log(
        `DELETE FROM product_document where document_image='${req.body.new_file}'`
      );
      // console.log(
      //   "product image deleted , id=,results=",
      //   req.body.productId,
      //   results
      // );
      await conn.end();
      return results;
    }
    // end

    // start - Code to delete from BUCKET
    // commenting since we dont need to delete from bucket due to duplicate concept

    // ONLY DELETE IMAGES FROM BUCKET IF THEY ARE NOT PRODUCT IMAGES SINCE DUPLICATE PRODUCT LOGIC CAUSES BUGS IF PRODUCT IMAGES ARE DELETED
    // ONE EXCEPTION IS THAT IF PRODUCT IMAGE COMES FROM ADD PRODUCT FORM, WE CAN DELETE FROM BUCKET
    if (containerName !== "productimages" || req.body.delete_type == "bucket") {
      const account = process.env.AZZURE_ACCOUNT_NAME;
      const accountKey = process.env.AZZURE_ACCOUNT_KEY;
      // Use StorageSharedKeyCredential with storage account and account key
      // StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
      const sharedKeyCredential = new StorageSharedKeyCredential(
        account,
        accountKey
      );
      const blobService = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        sharedKeyCredential
      );
      const containerClient = blobService.getContainerClient(containerName);
      await containerClient.createIfNotExists({
        access: "container",
      });

      const options = {
        deleteSnapshots: "include", // or 'only'
      };
      // Create blob client from container client
      const blockBlobClient = containerClient.getBlockBlobClient(
        file.split("/").pop()
      );
      const deletedBlobResponse = await blockBlobClient.delete(options);

      console.log(
        `deleted block blob ${blockBlobClient} successfully`,
        deletedBlobResponse
      );
      return deletedBlobResponse;
    }

    // END - Code to delete from BUCKET
  } catch (error) {
    // await conn.end();
    console.log("In deleteUploadImage error:", error);
    throw new ApiError(httpStatus.NOT_FOUND, "deleteUploadImage Failed!");
  }
};

const getIndustriesTable = async (req) => {
  console.log("In getIndustriesTable", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    console.log("pagefrom!!!!!!!!!!", pagefrom);

    // const [results] = await conn.execute(
    //   `SELECT id,name,priority,status
    //   FROM ${config.env}.industries_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    // );
    // new query for new industries page
    const [results] = await conn.execute(
      `select i.id, i.name, i.priority,i.status, i.imgUrl,JSON_ARRAYAGG(JSON_OBJECT('id', z.id,'category_Name',z.name,'isLinked',0)) filterJson,group_concat(z.name SEPARATOR '=') category_name from industries_master i inner join industries_category_mapping c on i.id=c.industry_id
    left join category z on c.category_id=z.id
    group by i.id,i.name,i.status;`
    );

    console.log("resssssssssssssss results", results);
    // start1 - if results are null, return page 1
    if (results.length == 0) {
      pagefrom = req.pageSize * 1 - req.pageSize;
      const [results] = await conn.execute(
        `SELECT id,name,priority,status
        FROM ${config.env}.industries_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
      );
      return results;
    }
    //end1

    conn.end();
    return results;
  } catch (e) {
    console.log("In getIndustriesTable Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getIndustriesTable Error :${error}`
    );
  }
};

const getIndustriesTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total from (select i.id, i.name, i.priority,i.status, i.imgUrl,JSON_ARRAYAGG(JSON_OBJECT('id', z.id,'category_Name',z.name,'isLinked',0)) filterJson,group_concat(z.name SEPARATOR '=') category_name from industries_master i inner join industries_category_mapping c on i.id=c.industry_id
      left join category z on c.category_id=z.id
      group by i.id,i.name,i.status) as x`
    );
    console.log("results", results);
    conn.end();
    return results;
  } catch (e) {
    console.log("In getIndustriesTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getIndustriesTableCount Error :${error}`
    );
  }
};

const getAssemblySolutionsTable = async (req) => {
  console.log("In getAssemblySolutionsTable", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    console.log("pagefrom!!!!!!!!!!", pagefrom);

    // const [results] = await conn.execute(
    //   `SELECT id,name,priority,status
    //   FROM ${config.env}.industries_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    // );
    // new query for new industries page
    const [results] = await conn.execute(
      `select id,name from ${config.env}.category where parent_id = 0 and isAssemblySolutions = 1;`
    );

    console.log("resssssssssssssss getAssemblySolutionsTable results", results);
    // // start1 - if results are null, return page 1
    // if (results.length == 0) {
    //   pagefrom = req.pageSize * 1 - req.pageSize;
    //   const [results] = await conn.execute(
    //     `SELECT id,name,priority,status
    //     FROM ${config.env}.industries_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    //   );
    //   return results;
    // }
    // //end1

    conn.end();
    return results;
  } catch (e) {
    console.log("In getIndustriesTable Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getIndustriesTable Error :${error}`
    );
  }
};

const getAssemblySolutionsTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.category where name like '%${req.key}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getAssemblySolutionsTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getAssemblySolutionsTableCount Error :${error}`
    );
  }
};

const saveIndustry = async (req) => {
  console.log("In saveIndustry", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `insert into ${config.env}.industries_master 
      (status,name,priority,imgUrl) 
        values(${req.status},'${req.name}','${req.priority}','${req.imageUrl}')`
    );

    console.log(results);
    for (let i = 0; i < req.categories.length; i++) {
      await conn.execute(
        `insert into ${config.env}.industries_category_mapping
      (industry_id,category_id)
        values(${results.insertId},'${req.categories[i]}')`
      );
    }

    conn.end();

    return [];
  } catch (e) {
    console.log("saveIndustry Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `saveIndustry Error :${e}`
    );
  }
};

const saveAssemblySolutions = async (req) => {
  console.log("In saveAssemblySolutions", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    for (let i = 0; i < req.categories.length; i++) {
      // updating parent id to 1 as well to make sub cat also as assembly solution
      const [results] = await conn.execute(
        `update ${config.env}.category 
      set isAssemblySolutions = 1 where id=${req.categories[i]} OR parent_id=${req.categories[i]}`
      );
    }

    /* QUERY TO MAKE ALL PRODUCTS UNDER ASSEMBLY SOLUTIONS AS product_type = 2*/
    // const [results] = await conn.execute(`UPDATE ${config.env}.product
    //   SET
    //   product_type = 2
    //   WHERE id in ( select pc.product_id from product_category pc
    //    join category c on c.id = pc.category_id where c.name like concat ((select name from category where isAssemblySolutions = 1),"%"));`);

    const [results] = await conn.execute(`UPDATE ${config.env}.product
    SET
    product_type = 2
    WHERE id in ( select pc.product_id from product_category pc
     join category c on c.id = pc.category_id where c.isAssemblySolutions = 1);`);

    conn.end();

    return [];
  } catch (e) {
    console.log("saveIndustry Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `saveIndustry Error :${e}`
    );
  }
};
const deleteIndustry = async (req) => {
  console.log("delete deleteIndustry SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // await conn.execute(
    //   `ALTER TABLE ${config.env}.industries_master AUTO_INCREMENT = 1`
    // );
    const [results] = await conn.execute(
      `delete from ${config.env}.industries_master where id='${req.id}'`
    );
    // also delete the mapping between industry and categories
    const [results2] = await conn.execute(
      `delete from ${config.env}.industries_category_mapping where industry_id='${req.id}'`
    );

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteIndustry:${e}`
    );
  }
};
const deleteAssemblySolutions = async (req) => {
  console.log("delete deleteAssemblySolutions SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // updating parent id to 0 as well to make sub cat also not as assembly solution
    const [results] = await conn.execute(
      `update ${config.env}.category set isAssemblySolutions = 0 where id='${req.id}' OR parent_id='${req.id}'`
    );

    /* QUERY TO MAKE ALL PRODUCTS NOT UNDER ASSEMBLY SOLUTIONS AS product_type = 1*/
    // const [resultsTwo] = await conn.execute(`UPDATE ${config.env}.product
    //  SET
    //  product_type = 1
    //  WHERE id in ( select pc.product_id from product_category pc
    //   join category c on c.id = pc.category_id where c.name like concat ((select name from category where isAssemblySolutions = 0),"%"));`);

    const [resultsTwo] = await conn.execute(`UPDATE ${config.env}.product
    SET
    product_type = 1
    WHERE id in ( select pc.product_id from product_category pc
     join category c on c.id = pc.category_id where c.isAssemblySolutions = 0);`);

    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteIndustry:${e}`
    );
  }
};

const updateIndustry = async (req) => {
  //console.log("In category>>>>>>>>>>>>", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // const [imageDetail] = await conn.execute(
    //   `SELECT img_name FROM ${config.env}.temp_image_hold where prod_id='${req.id}'`
    // );

    await conn.execute(
      `update ${config.env}.industries_master set 
        status=${req.status}
        ,name='${req.name}'
        ,priority='${req.priority}'
        ,imgUrl='${req.imageUrl}'
         where id='${req.id}'`
    );
    await conn.execute(
      `delete from ${config.env}.industries_category_mapping where industry_id=${req.id}`
    );
    for (let i = 0; i < req.categories.length; i++) {
      await conn.execute(
        `insert into ${config.env}.industries_category_mapping
      (industry_id,category_id)
        values(${req.id},'${req.categories[i]}')`
      );
    }

    conn.end();

    return [];
  } catch (e) {
    console.log("updateIndustry Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error updateIndustry:${e}`
    );
  }
};

const getBrandsTable = async (req) => {
  console.log("In getBrandsTable", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,name,priority,status,image_url
      FROM ${config.env}.brands_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getBrandsTable Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getIndustriesTable Error :${error}`
    );
  }
};

const getBrandsTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.brands_master where name like '%${req.key}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getBrandsTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getBrandsTableCount Error :${error}`
    );
  }
};

const saveBrand = async (req) => {
  console.log("In saveBrand", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    await conn.execute(
      `insert into ${config.env}.brands_master 
      (status,name,priority,image_url) 
        values(${req.status},'${req.name}','${req.priority}','${req.imageUrl}')`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("saveBrand Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `saveBrand Error :${e}`
    );
  }
};

const deleteBrand = async (req) => {
  console.log("delete deleteBrand SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // await conn.execute(
    //   `ALTER TABLE ${config.env}.industries_master AUTO_INCREMENT = 1`
    // );
    const [results] = await conn.execute(
      `delete from ${config.env}.brands_master where id='${req.id}'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteBrand:${e}`
    );
  }
};

const updateBrand = async (req) => {
  //console.log("In category>>>>>>>>>>>>", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // const [imageDetail] = await conn.execute(
    //   `SELECT img_name FROM ${config.env}.temp_image_hold where prod_id='${req.id}'`
    // );

    await conn.execute(
      `update ${config.env}.brands_master set 
        status=${req.status}
        ,name='${req.name}'
        ,priority='${req.priority}'
        ,image_url='${req.imageUrl}'
         where id='${req.id}'`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("updateBrand Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error updateBrand:${e}`
    );
  }
};

const getIndustriesListData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.industries_master as c order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getIndustriesListData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getIndustriesListData :${error}`
    );
  }
};

const getBrandsListData = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name FROM ${config.env}.brands_master as c order by name asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getBrandsListData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getBrandsListData:${error}`
    );
  }
};
const getFilterNameList = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT subCatId,custmFilterNumber,filterName FROM ${config.env}.subCat_product_filter_master order by custmFilterNumber asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getFilterNameList Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getFilterNameList:${error}`
    );
  }
};

const getSectionList = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `select id,tag_name as section_name from ${config.env}.tag_master`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getFilterNameList Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getFilterNameList:${error}`
    );
  }
};
const getCableList = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `select id,sparky_id ,pricing_per_meter from ${config.env}.cust_preassembles_cables_master where status= 1 order by created_at asc`
    );
    // console.log({results})
    conn.end();
    return results;
  } catch (e) {
    console.log("In getTerminalList Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCableList:${error}`
    );
  }
};
const getTerminalList = async () => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `select id,sparky_id ,price , assembly_charges from ${config.env}.cust_preassembles_terminal_master where status= 1 order by created_at asc`
    );
    // console.log({results})
    conn.end();
    return results;
  } catch (e) {
    console.log("In getTerminalList Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getTerminalList:${error}`
    );
  }
};

const getCataloguesTable = async (req) => {
  console.log("In getCataloguesTable", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    const [results] = await conn.execute(
      `SELECT id,name,priority,status,cover_image_url,file_url
      FROM ${config.env}.catalogues_master as c order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCataloguesTable Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getCataloguesTable Error :${error}`
    );
  }
};

const getCataloguesTableCount = async (req) => {
  // console.log("In category");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.catalogues_master where name like '%${req.key}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCataloguesTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `getCataloguesTableCount Error :${error}`
    );
  }
};

const saveCatalogue = async (req) => {
  console.log("In saveCatalogue", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    await conn.execute(
      `insert into ${config.env}.catalogues_master 
      (status,name,priority,cover_image_url,file_url) 
        values(${req.status},'${req.name}','${req.priority}','${req.imageUrl}','${req.fileUrl}')`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("saveCatalogue Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `saveCatalogue Error :${e}`
    );
  }
};

const deleteCatalogue = async (req) => {
  console.log("delete deleteCatalogue SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // await conn.execute(
    //   `ALTER TABLE ${config.env}.industries_master AUTO_INCREMENT = 1`
    // );
    const [results] = await conn.execute(
      `delete from ${config.env}.catalogues_master where id='${req.id}'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteCatalogue:${e}`
    );
  }
};

const updateCatalogue = async (req) => {
  //console.log("In category>>>>>>>>>>>>", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // const [imageDetail] = await conn.execute(
    //   `SELECT img_name FROM ${config.env}.temp_image_hold where prod_id='${req.id}'`
    // );

    await conn.execute(
      `update ${config.env}.catalogues_master set 
        status=${req.status}
        ,name='${req.name}'
        ,priority='${req.priority}'
        , cover_image_url = '${req.imageUrl}'
        , file_url = '${req.fileUrl}'
         where id='${req.id}'`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("updateCatalogue Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error updateCatalogue:${e}`
    );
  }
};

const getCmsUserTableData = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;

    // const [results] = await conn.execute(
    //   `SELECT id,admin_emailid,admin_password,status
    //   FROM ${config.env}.admin_login order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    // );

    // new query wihtout password
    const [results] = await conn.execute(
      `SELECT id,admin_emailid,status
      FROM ${config.env}.admin_login order by id asc LIMIT ${pagefrom}, ${req.pageSize}`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("getCmsUserTableData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCmsUserTableData:${error}`
    );
  }
};

const getCmsUserTableCount = async (req) => {
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.admin_login`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("getCmsUserTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCmsUserTableCount:${error}`
    );
  }
};
const addCmsUser = async (req) => {
  console.log("addCmsUser", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    await conn.execute(
      `insert into ${config.env}.admin_login 
      (admin_emailid,admin_password,status) 
        values('${req.userId}','${req.password}',${req.status})`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("addCmsUser Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error addCmsUser:${e}`
    );
  }
};

const activeCmsUser = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `update ${config.env}.admin_login set status = 1 where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error activeCmsUser:${e}`
    );
  }
};

const inactiveCmsUser = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.query(
      `update ${config.env}.admin_login set status = 0 where id='${req.id}'`
    );

    conn.end();
    return [];
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error inactiveCmsUser:${e}`
    );
  }
};

const uploadCustPreAssembleData = async (req) => {
  // console.log("^^^^^^^^^^^^^^^ uploadCustPreAssembleData SERVICE req = ", req);
  console.log(
    "^^^^^^^^^^^^^^^ uploadCustPreAssembleData SERVICE req.type = ",
    req.type
  );
  // return;
  // let arr = [];
  // let obj = {};
  // for (let i = 2; i < req.length; i++) {
  //   obj.req[0][0] = req[i][0];
  //   obj.req[0][0] = req[i][0];
  //   obj.req[0][0] = req[i][0];
  //   obj.req[0][0] = req[i][0];
  //   arr.push[obj]
  // }
  const mainData = req.mainData;
  console.log("mainData", mainData);
  // return;
  const resJson = {
    totalItems: 0,
    totalInsert: 0,
    totalUpdated: 0,
    message: "",
  };
  // return resJson;
  let conn = "";
  if (req.type == "cables") {
    // check if excel col headings are correct
    const element = mainData[0];
    let isValidExcel = false;
    console.log("eeee in format check element = ", element);
    if (
      element[0] == "Filter 1" &&
      element[1] == "Filter 2" &&
      element[2] == "Filter 3" &&
      element[3] == "Filter 4" &&
      element[4] == "Filter 5" &&
      element[5] == "Filter 6" &&
      element[6] == "Filter 7" &&
      element[7] == "Jacket Colour" &&
      element[8] == "Pricing/Meter" &&
      element[9] == "Status" &&
      element[10] == "Sparky ID" &&
      element[11] == "Image URL"
    ) {
      isValidExcel = true;
    }
    if (isValidExcel == false) {
      resJson.message =
        "Invalid Excel Format! Please check the column header names again";
      return resJson;
    }
  } else {
    // check if excel col headings are correct
    for (let index = 0; index < 1; index++) {
      let isValidExcel = false;
      const element = mainData[index];
      if (
        element[0] == "Main Filter" &&
        element[1] == "Filter 1" &&
        element[2] == "Filter 2" &&
        element[3] == "Filter 3" &&
        element[4] == "Filter 4" &&
        element[5] == "Filter 5" &&
        element[6] == "Filter 6" &&
        element[7] == "Filter 7" &&
        element[8] == "Manf ID" &&
        element[9] == "Sparky ID" &&
        element[10] == "Price" &&
        element[11] == "Assembly Charges" &&
        element[12] == "Image URL for T1" &&
        element[13] == "Image URL for T2" &&
        element[14] == "Status"
      ) {
        isValidExcel = true;
      }
      if (isValidExcel == false) {
        resJson.message =
          "Invalid Excel Format! Please check the column header names again";
        return resJson;
      }
    }
  }
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    resJson.totalInsert = 0;
    resJson.totalUpdated = 0;
    if (req.type == "cables") {
      resJson.totalItems = mainData.length - 1;
      for (let index = 1; index < mainData.length; index++) {
        const element = mainData[index];
        console.log("eeeeeeeeeeeeeeeeeeeeeeeee element", element);
        const [isExistsData] = await conn.execute(
          `SELECT count(1) as tot FROM ${config.env}.cust_preassembles_cables_master WHERE sparky_id = ?`,
          [element[10]]
        );
        console.log(" !!!!!!!!!!!!!!!!! isExistsData", isExistsData);
        if (isExistsData[0].tot == 0) {
          let tempArray = [];
          for (let j = 0; j < element.length; j++) {
            tempArray.push(element[j]);
          }
          console.log("xxxxxxxxxxxxxxxxxxxx tempArray=", tempArray);
          console.log(``);
          await conn.query(
            `INSERT INTO ${config.env}.cust_preassembles_cables_master (
              filter_1, filter_2, filter_3, filter_4, filter_5, filter_6, filter_7,
              jacket_colour, pricing_per_meter, status, sparky_id, img_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            tempArray
          );
          // }
          resJson.totalInsert += 1;
        } else {
          let tempArray = [];
          for (let j = 0; j < element.length; j++) {
            tempArray.push(element[j]);
          }
          tempArray.push(element[10]); 
          console.log("xxxxxxxxxxxxxxxxxxxx tempArray=", tempArray);
          await conn.query(
            `UPDATE ${config.env}.cust_preassembles_cables_master SET
              filter_1 = ?, filter_2 = ?, filter_3 = ?, filter_4 = ?, filter_5 = ?,
              filter_6 = ?, filter_7 = ?, jacket_colour = ?, pricing_per_meter = ?,
              status = ?, sparky_id = ? , img_url = ?
            WHERE sparky_id = ?`,
            tempArray
          );
        
          resJson.totalUpdated = parseInt(resJson.totalUpdated) + 1;
        }
      }

      if (resJson.totalItems && resJson.totalItems > 0) {
        await conn.query(
          `insert into ${config.env}.cust_preassembles_cables_upload_log (total_item,total_insert,total_update) values(?,?,?)`,
          [resJson.totalItems, resJson.totalInsert, resJson.totalUpdated]
        );

        resJson.message = "Data Uploaded Successfully!";
      } else {
        resJson.message = "Something went wrong!!";
      }

      return resJson;
    } else {
      resJson.totalItems = mainData.length - 1;
      for (let index = 1; index < mainData.length; index++) {
        const element = mainData[index];
        console.log("eeeeeeeeeeeeeeeeeeeeeeeee element", element);
        const [isExistsData] = await conn.execute(
          `select count(1) as tot  from  ${config.env}.cust_preassembles_terminal_master where sparky_id = '${element[9]}'`
        );
        console.log(" !!!!!!!!!!!!!!!!! isExistsData", isExistsData);
        if (isExistsData[0].tot == 0) {
          let tempArray = [];
          for (let j = 0; j < element.length; j++) {
            tempArray.push(element[j]);
          }
          console.log("xxxxxxxxxxxxxxxxxxxx tempArray=", tempArray);
          // for (let j = 0; j < element.length; j++) {
          await conn.query(
            `insert into ${config.env}.cust_preassembles_terminal_master (main_filter,
          filter_1,
          filter_2, 
          filter_3,
          filter_4,
          filter_5,
          filter_6,
          filter_7,
          manf_id,
          sparky_id,
          price,
          assembly_charges,
          img_url_t1,
          img_url_t2,
          status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            tempArray
            // [
            //   element[0],
            //   element[1],
            //   element[2],
            //   element[3],
            //   element[4],
            //   element[5],
            //   element[6],  
            //   element[7],
            //   element[8],
            //   element[9],
            //   element[10],
            //   element[11],
            //   element[12],
            //   element[13],
            // ]
          );
          // }
          resJson.totalInsert = parseInt(resJson.totalInsert) + 1;
        } else {
          let tempArray = [];
          for (let j = 0; j < element.length; j++) {
            tempArray.push(element[j]);
          }
          tempArray.push(element[9]);
          console.log("xxxxxxxxxxxxxxxxxxxx tempArray=", tempArray);
           await conn.query(
            `update ${config.env}.cust_preassembles_terminal_master set main_filter = ?,
              filter_1 = ?,
              filter_2 = ?,
              filter_3 = ?,
              filter_4 = ?,
              filter_5 = ?,
              filter_6 = ?,
              filter_7 = ?,
              manf_id = ?,
              sparky_id = ?,
              price = ?,
              assembly_charges = ?,
              img_url_t1 = ?,
              img_url_t2 = ?,
              status=? WHERE sparky_id = ?;`,
            tempArray
          );
          resJson.totalUpdated = parseInt(resJson.totalUpdated) + 1;
        }
      }

      if (resJson.totalItems && resJson.totalItems > 0) {
        await conn.query(
          `insert into ${config.env}.cust_preassembles_terminal_upload_log (total_item,total_insert,total_update) values(?,?,?)`,
          [resJson.totalItems, resJson.totalInsert, resJson.totalUpdated]
        );

        resJson.message = "Data Uploaded Successfully!";
      } else {
        resJson.message = "Something went wrong!!";
      }

      return resJson;
    }
  } catch (e) {
    console.log(" uploadCustPreAssembleData Error::::", e);
    conn.end();
    return resJson;
  } finally {
    conn.end();
  }
};

const getCustPreassembleTableData = async (req) => {
  console.log("getCustPreassembleTableData :::::::::::::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;
    if (req.filter == 2 && !req.keyword) {
      // removing limit for filters to work
      if (req.type == "cables") {
        const [results] = await conn.execute(
          `select sparky_id, img_url, filter_1, case when filter_3 is null then JSON_ARRAY(filter_2) when filter_4 is null then JSON_ARRAY(filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, jacket_colour,pricing_per_meter,status from ${config.env}.cust_preassembles_cables_master order by created_at asc`
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select sparky_id, img_url_t1, img_url_t2, main_filter,case when filter_2 is null then JSON_ARRAY(filter_1) when filter_3 is null then JSON_ARRAY(filter_1,filter_2) when filter_4 is null then JSON_ARRAY(filter_1,filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, price,assembly_charges,status,manf_id, filter_2, filter_3, filter_4, filter_5, filter_6, filter_7  from  ${config.env}.cust_preassembles_terminal_master order by created_at asc`
        );
        conn.end();
        return results;
      }
    } else if (req.keyword) {
      const keywordSearch = "'%" + req.keyword + "%'";
      // removing limit for filters to work
      if (req.type == "cables") {
        const [results] = await conn.execute(
          `select sparky_id, img_url, filter_1, case when filter_3 is null then JSON_ARRAY(filter_2) when filter_4 is null then JSON_ARRAY(filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, jacket_colour,pricing_per_meter,status from ${config.env}.cust_preassembles_cables_master where sparky_id like ${keywordSearch} order by created_at asc`
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select sparky_id, img_url_t1, img_url_t2, main_filter,case when filter_2 is null then JSON_ARRAY(filter_1) when filter_3 is null then JSON_ARRAY(filter_1,filter_2) when filter_4 is null then JSON_ARRAY(filter_1,filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, price,assembly_charges,status,manf_id, filter_2, filter_3, filter_4, filter_5, filter_6, filter_7 from  ${config.env}.cust_preassembles_terminal_master where sparky_id like ${keywordSearch} order by created_at asc`
        );
        conn.end();
        return results;
      }
    } else {
      if (req.type == "cables") {
        const [results] = await conn.execute(
          `select sparky_id, img_url, filter_1, case when filter_3 is null then JSON_ARRAY(filter_2) when filter_4 is null then JSON_ARRAY(filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, jacket_colour,pricing_per_meter,status from ${config.env}.cust_preassembles_cables_master where status= ${req.filter} order by created_at asc`
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select sparky_id, img_url_t1, img_url_t2, main_filter,case when filter_2 is null then JSON_ARRAY(filter_1) when filter_3 is null then JSON_ARRAY(filter_1,filter_2) when filter_4 is null then JSON_ARRAY(filter_1,filter_2,filter_3) when filter_5 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4) when filter_6 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5) when filter_7 is null then JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6) else JSON_ARRAY(filter_1,filter_2,filter_3,filter_4,filter_5,filter_6,filter_7) end as all_filters, price,assembly_charges,status,manf_id, filter_2, filter_3, filter_4, filter_5, filter_6, filter_7 from  ${config.env}.cust_preassembles_terminal_master where status= ${req.filter} order by created_at asc`
        );
        conn.end();
        return results;
      }
    }
  } catch (e) {
    console.log("getCustPreassembleTableData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassembleTableData:${e}`
    );
  }
};

const getCustPreassembleTableCount = async (req) => {
  console.log("In getCustPreassembleTableCount");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    if (!req.keyword) {
      if (req.type == "cables") {
        const [results] = await conn.execute(
          `select count(1) as total  from  ${config.env}.cust_preassembles_cables_master as pp   `
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select count(1) as total  from  ${config.env}.cust_preassembles_terminal_master as pp   `
        );

        conn.end();
        return results;
      }
    } else {
      const keywordSearch = "'%" + req.keyword + "%'";
      if (req.type == "cables") {
        const [results] = await conn.execute(
          `select count(1) as total  from  ${config.env}.cust_preassembles_cables_master as pp where sparky_id like  ${keywordSearch}`
        );
        conn.end();
        return results;
      } else {
        const [results] = await conn.execute(
          `select count(1) as total  from  ${config.env}.cust_preassembles_terminal_master as pp where sparky_id like  ${keywordSearch}`
        );

        conn.end();
        return results;
      }
    }
  } catch (e) {
    console.log("getCustPreassembleTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassembleTableCount:${error}`
    );
  }
};

const deleteCMSUser = async (req) => {
  console.log("delete deleteCMSUser SERVICE ::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // await conn.execute(
    //   `ALTER TABLE ${config.env}.industries_master AUTO_INCREMENT = 1`
    // );
    const [results] = await conn.execute(
      `delete from ${config.env}.admin_login where id='${req.id}'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error deleteCMSUser:${e}`
    );
  }
};

const getQuotationsTableData = async (req) => {
  console.log("getQuotationsTableData :::::::::::::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;
    console.log(
      `SELECT qm.*, u.email FROM  ${config.env}.quotation_master qm join  ${config.env}.user u where qm.customerID = u.uuid LIMIT ${pagefrom}, ${req.pageSize};`
    );
    const [results] = await conn.execute(
      `SELECT qm.*, u.email FROM  ${config.env}.quotation_master qm join  ${config.env}.user u where qm.customerID = u.uuid LIMIT ${pagefrom}, ${req.pageSize};`
    );
    return results;
  } catch (e) {
    console.log("getCustPreassembleTableData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassembleTableData:${e}`
    );
  }
};

const getQuotationsTableCount = async (req) => {
  console.log("In getQuotationsTableCount");
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `select count(1) as total  from  ${config.env}.quotation_master as qm`
    );
    conn.end();
    return results;
  } catch (e) {
    console.log("getCustPreassembleTableCount Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassembleTableCount:${error}`
    );
  }
};

const getQuoteData = async (req) => {
  console.log("getQuoteData SERVICE req==============>", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select u.first_name,u.last_name,qm.subAmount, qm.shippingAmount,qm.totalAmount,qlm.quoteId,qlm.productSimpleID as id,qlm.productName as name,qlm.productImage as image,qlm.itemPrice as price,qlm.quantity as qty
      from quotation_lineitems qlm 
      join quotation_master qm 
      join user u
      where qlm.quoteId=qm.quoteId 
      and u.uuid = qm.customerID
      and qm.quoteId = ${req.quoteId};`
    );
    // console.log("RESULTS!!!!!!!!!!!!!!!", results);
    // const [secondResults] = await conn.execute(
    //   `select l.*, p.name from ${config.env}.lineitems l JOIN ${config.env}.product p ON l.productSimpleID = p.id WHERE l.orderID = '${req.orderId}'`
    // );
    // console.log("SECOND RESULTS!!!!!!!!!!!!!!!", secondResults);
    // results.push(secondResults);
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getQuoteData Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const crudVoucher = async (req) => {
  console.log("^^^^^^^^^^^^^^^ crudVoucher SERVICE req = ", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // console.log(`insert into ${
    //   config.env
    // }.email_vouchers(voucherName,custEmailId,isMultiple,maxNumberUsage,amountType,flatAmount,discountPercentage,maxAmountIfPercentage,expiryDateTime)
    // VALUES('${req.voucherName}','${req.email}',${req.isMultiple},${
    //   req.maxNumberUsage ? req.maxNumberUsage : null
    // },${req.amountType}, ${req.flatAmount ? req.flatAmount : null},${
    //   req.discountPercentage ? req.discountPercentage : null
    // },${req.maxAmountIfPercentage ? req.maxAmountIfPercentage : null},'${
    //   req.expiryDateTime
    // }')`);
    if (req.crudMethod == "create") {
      const [results] = await conn.execute(
        `insert into ${
          config.env
        }.email_vouchers(voucherName,custEmailId,minCartAmount,isMultiple,maxNumberUsage,amountType,flatAmount,discountPercentage,maxAmountIfPercentage,startDateTime,expiryDateTime)
        VALUES('${req.voucherName}','${req.email}',${req.minCartAmount},${
          req.isMultiple
        },${req.isMultiple == 0 ? 1 : req.maxNumberUsage},${req.amountType}, ${
          req.flatAmount ? req.flatAmount : null
        },${req.discountPercentage ? req.discountPercentage : null},${
          req.maxAmountIfPercentage ? req.maxAmountIfPercentage : null
        },'${req.scheduledDateTime[0]}','${req.scheduledDateTime[1]}')`
      );
      conn.end();
      return results;
    } else if (req.crudMethod == "read") {
      const [results] = await conn.execute(
        // `SELECT *,date_format(startDateTime,'%d-%m-%Y') FROM ${config.env}.email_vouchers where custEmailId='${req.email}' `
        `SELECT * FROM ${config.env}.email_vouchers where custEmailId='${req.email}' `
      );
      conn.end();
      return results;
    } else if (req.crudMethod == "delete") {
      const [result] = await conn.execute(
        `delete from ${config.env}.email_vouchers where id=${req.id}`
      );
      return result;
    }
  } catch (e) {
    console.log("crudVoucher Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `crudVoucher Error :${e}`
    );
  }
};

const crudProductDiscount = async (req) => {
  console.log("^^^^^^^^^^^^^^^ crudProductDiscount SERVICE req = ", req);
  // if (req.crudMethod != "read") {
  //   return;
  // }
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    if (req.crudMethod == "create") {
      const [results] = await conn.execute(
        `insert into ${
          config.env
        }.email_product_discount(discountName,custEmailId,discountPercentage,startDateTime,expiryDateTime)
        VALUES('${req.discountName}','${req.email}',${
          req.discountPercentage ? req.discountPercentage : null
        },'${req.scheduledDateTime[0]}','${req.scheduledDateTime[1]}')`
      );
      conn.end();
      return results;
    } else if (req.crudMethod == "read") {
      const [results] = await conn.execute(
        // `SELECT *,date_format(startDateTime,'%d-%m-%Y') FROM ${config.env}.email_vouchers where custEmailId='${req.email}' `
        `SELECT * FROM ${config.env}.email_product_discount where custEmailId='${req.email}' `
      );
      conn.end();
      return results;
    } else if (req.crudMethod == "update") {
      const [result] = await conn.execute(
        `update ${config.env}.email_product_discount set discountName='${req.discount_name}', 
          startDateTime='${req.scheduledDateTime[0]}', 
          expiryDateTime='${req.scheduledDateTime[1]}',
          discountPercentage=${req.discount_value}
          where id=${req.discount_id}
          `
      );
      return result;
    } else if (req.crudMethod == "delete") {
      const [result] = await conn.execute(
        `delete from ${config.env}.email_product_discount  where id=${req.id}`
      );
      return result;
    }
  } catch (e) {
    console.log("crudVoucher Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `crudVoucher Error :${e}`
    );
  }
};

const crudProductFilters = async (req) => {
  console.log("^^^^^^^^^^^^^^^ crudProductFilters SERVICE req = ", req);
  // return;
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // console.log(`insert into ${
    //   config.env
    // }.email_vouchers(voucherName,custEmailId,isMultiple,maxNumberUsage,amountType,flatAmount,discountPercentage,maxAmountIfPercentage,expiryDateTime)
    // VALUES('${req.voucherName}','${req.email}',${req.isMultiple},${
    //   req.maxNumberUsage ? req.maxNumberUsage : null
    // },${req.amountType}, ${req.flatAmount ? req.flatAmount : null},${
    //   req.discountPercentage ? req.discountPercentage : null
    // },${req.maxAmountIfPercentage ? req.maxAmountIfPercentage : null},'${
    //   req.expiryDateTime
    // }')`);
    if (req.crudMethod == "create") {
      var [isExists] = await conn.execute(
        `select id from ${config.env}.subCat_product_filter_master where subCatId=${req.subCategory}`
      );
      console.log("isExists crudProductFilters", isExists);
      if (isExists.length > 0) {
        console.log("exists", isExists);
        return;
      }
      for (let i = 1; i <= req.countFilters; i++) {
        console.log(`insert into ${config.env}.subCat_product_filter_master(subCatId,subCatName,filterName,custmFilterNumber)
        VALUES('${req.subCategory}','${req.valueCategoryWithSubCategoryName}','${req[i]}',${i})`);
        var [results] = await conn.execute(
          `insert into ${config.env}.subCat_product_filter_master(subCatId,subCatName,filterName,custmFilterNumber)
        VALUES('${req.subCategory}','${req.valueCategoryWithSubCategoryName}','${req[i]}',${i})`
        );
      }
      conn.end();
      return results;
    } else if (req.crudMethod == "read") {
      const [results] = await conn.execute(
        // `SELECT *,date_format(startDateTime,'%d-%m-%Y') FROM ${config.env}.email_vouchers where custEmailId='${req.email}' `
        `select subcatId, SUBSTRING_INDEX(c.name,'/',1) as category,SUBSTRING_INDEX(c.name,'/',-1) as sub_category,
         JSON_ARRAYAGG(JSON_OBJECT('custmFilterNumber', custmFilterNumber,'filterName',filterName)) product_filter_json
         from subcat_product_filter_master 
         join category c on c.id = subCatId
         group by c.id,subcatId,category,sub_category`
      );
      conn.end();
      return results;
    } else if (req.crudMethod == "delete") {
      const [result] = await conn.execute(
        `delete from ${config.env}.email_vouchers where id=${req.id}`
      );
      return result;
    }
  } catch (e) {
    console.log("crudProductFilters Error::::", e);
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `crudProductFilters Error :${e}`
    );
  }
};

const createOrderInTLM = async (req, res) => {
  let callApiUrl = `https://tlm.saviy.com.au/als_dma_prog/v20220912/ut_tricab_sparky_api.php`;
  console.log("createOrderInTLM SERVICES req.body = ", req.body);
  var jsonForTLM = { ...req.body };
  delete jsonForTLM.orderUuid;
  delete jsonForTLM.updatedBy;
  console.log("createOrderInTLM SERVICES jsonForTLM = ", jsonForTLM);
  let conn = "";
  await axios
    .post(`${callApiUrl}`, jsonForTLM, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    })
    .then(async function (response) {
      // console.log("%%%%%%%%%%%%%%%%%%%%", response.data);
      let formattedData = response.data.split("json_response");
      // console.log("%%%%%%%%%%%%%%%%%%%%22222222222", formattedData[1]);
      let formattedData2 = formattedData[1].split("=:=");
      // console.log("%%%%%%%%%%%%%%%%%%%%3333333333", formattedData2[1]);
      formattedData2[1] = JSON.parse(formattedData2[1]);
      // console.log("%%%%%%%%%%%%%%%%%%%%444444444", formattedData2[1]);
      conn = await mysql.createConnection(config.mysqlDBConfig);
      console.log(`insert into ${config.env}.TLM_create_order_logs(orderUuid,externalReference,CN_NUMBER,CUSTOMER_REFERENCE,CARRIER,STATUS,updatedBy)
      VALUES('${req.body.orderUuid}','${req.body.orderId}','${formattedData2[1].CN_NUMBER}','${formattedData2[1].CUSTOMER_REFERENCE}','${formattedData2[1].CARRIER}','${formattedData2[1].STATUS}','${req.body.updatedBy}')`);

      const [results] = await conn.execute(
        `insert into ${config.env}.tlm_create_order_logs(orderUuid,externalReference,CN_NUMBER,CUSTOMER_REFERENCE,CARRIER,STATUS,updatedBy)
      VALUES('${req.body.orderUuid}','${req.body.orderId}','${formattedData2[1].CN_NUMBER}','${formattedData2[1].CUSTOMER_REFERENCE}','${formattedData2[1].CARRIER}','${formattedData2[1].STATUS}','${req.body.updatedBy}')`
      );
      console.log("TLM data inserted into DB!");
      res
        .status(200)
        .send({ msg: "createOrderInTLM ok", data: formattedData2[1] });
      // return response;
    })
    .catch(function (error) {
      console.log("createOrderInTLM AXIOS error", error);
      res.status(500).send(null);
    })
    .then(function () {});
};

const duplicateProduct = async (req) => {
  console.log("duplicateProduct  request data ::::", req);
  // return;
  const productDetailById = req.productDetailById;
  let conn = "";
  let prdstatus = productDetailById.status === true ? 1 : 0;
  let key_features;
  if (productDetailById.product_key_features != "") {
    key_features = parse(productDetailById.product_key_features);
  }
  let productDesc = parse(productDetailById.description);
  console.log("productDetailById ::::", productDetailById);
  // return;
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    console.log(
      `select sum(isDuplicate) as total_duplicates from product where sparky_id like "${req.productDetailById.sparky_id}%"`
    );
    const [totalDuplicates] = await conn.query(
      `select sum(isDuplicate) as total_duplicates from product where sparky_id like "${req.productDetailById.sparky_id}%"`
    );
    console.log("totalDuplicates! >>>>>>>>>>>", totalDuplicates);
    console.log(`insert into ${
      config.env
    }.product ( meta_keyword ,name, position,uuid ,slug ,title,meta_description ,status ,product_key_features ,sparky_id ,manufacturer_id ,description,product_type,pallets,weight,length,breadth,height,cbm,custmFilterNumber1,custmFilterNumber2,custmFilterNumber3,custmFilterNumber4,custmFilterNumber5,custmFilterNumber6,custmFilterNumber7,custmFilterNumber8,custmFilterNumber9,custmFilterNumber10,isDuplicate)
    values (
      '${productDetailById.meta_keyword}',
      '${productDetailById.name}-duplicate-${
      totalDuplicates[0].total_duplicates
    }',
       ${productDetailById.position},
      '${UUIDV4()}',
      '${productDetailById.slug}-duplicate-${
      totalDuplicates[0].total_duplicates
    }',
      '${productDetailById.name}-duplicate-${
      totalDuplicates[0].total_duplicates
    }',
      '${productDetailById.meta_description}',
       ${prdstatus},
      '${key_features}',
      '${productDetailById.sparky_id}-duplicate-${
      totalDuplicates[0].total_duplicates
    }',
      '${productDetailById.manufacturer_id}',
      '${productDesc}',
       ${productDetailById.product_type},
       ${productDetailById.pallets},
       ${productDetailById.weight},
       ${productDetailById.length},
       ${productDetailById.breadth},
       ${productDetailById.height},
       ${productDetailById.cbm},
       ${
         productDetailById.custmFilterNumber1
           ? `'${productDetailById.custmFilterNumber1}'`
           : null
       },
      ${
        productDetailById.custmFilterNumber2
          ? `'${productDetailById.custmFilterNumber2}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber3
          ? `'${productDetailById.custmFilterNumber3}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber4
          ? `'${productDetailById.custmFilterNumber4}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber5
          ? `'${productDetailById.custmFilterNumber5}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber6
          ? `'${productDetailById.custmFilterNumber6}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber7
          ? `'${productDetailById.custmFilterNumber7}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber8
          ? `'${productDetailById.custmFilterNumber8}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber9
          ? `'${productDetailById.custmFilterNumber9}'`
          : null
      },
      ${
        productDetailById.custmFilterNumber10
          ? `'${productDetailById.custmFilterNumber10}'`
          : null
      },
      1
       )`);

    const [results] = await conn.query(
      `insert into ${
        config.env
      }.product ( meta_keyword ,name, position,uuid ,slug ,title,meta_description ,status ,product_key_features ,sparky_id ,manufacturer_id ,description,product_type,pallets,weight,length,breadth,height,cbm,custmFilterNumber1,custmFilterNumber2,custmFilterNumber3,custmFilterNumber4,custmFilterNumber5,custmFilterNumber6,custmFilterNumber7,custmFilterNumber8,custmFilterNumber9,custmFilterNumber10,isDuplicate)
      values (
        '${productDetailById.meta_keyword}',
        '${productDetailById.name}-duplicate-${
        totalDuplicates[0].total_duplicates
      }',
         ${productDetailById.position},
        '${UUIDV4()}',
        '${productDetailById.slug}-duplicate-${
        totalDuplicates[0].total_duplicates
      }',
        '${productDetailById.name}-duplicate-${
        totalDuplicates[0].total_duplicates
      }',
        '${productDetailById.meta_description}',
         ${prdstatus},
        '${key_features}',
        '${productDetailById.sparky_id}-duplicate-${
        totalDuplicates[0].total_duplicates
      }',
        '${productDetailById.manufacturer_id}',
        '${productDesc}',
         ${productDetailById.product_type},
         ${productDetailById.pallets},
         ${productDetailById.weight},
         ${productDetailById.length},
         ${productDetailById.breadth},
         ${productDetailById.height},
         ${productDetailById.cbm},
         ${
           productDetailById.custmFilterNumber1
             ? `'${productDetailById.custmFilterNumber1}'`
             : null
         },
        ${
          productDetailById.custmFilterNumber2
            ? `'${productDetailById.custmFilterNumber2}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber3
            ? `'${productDetailById.custmFilterNumber3}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber4
            ? `'${productDetailById.custmFilterNumber4}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber5
            ? `'${productDetailById.custmFilterNumber5}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber6
            ? `'${productDetailById.custmFilterNumber6}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber7
            ? `'${productDetailById.custmFilterNumber7}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber8
            ? `'${productDetailById.custmFilterNumber8}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber9
            ? `'${productDetailById.custmFilterNumber9}'`
            : null
        },
        ${
          productDetailById.custmFilterNumber10
            ? `'${productDetailById.custmFilterNumber10}'`
            : null
        },
        1
         )`
    );

    await conn.execute(
      `INSERT INTO ${config.env}.stock_master (uid,sparky_id,manufacturer_id,stock,status,product_id) VALUES(?,?,?,?,?,?)`,
      [
        UUIDV4(),
        `${productDetailById.sparky_id}-duplicate-${totalDuplicates[0].total_duplicates}`,
        productDetailById.manufacturer_id,
        productDetailById.stock,
        1,
        results.insertId,
      ]
    );
    //////////////// insert product by category/////////////////
    // if (req.category_id && req.category_id.length > 0) {
    //   req.category_id.forEach(async (element) => {
    //     await conn.execute(
    //       `insert into ${config.env}.product_category(product_id,category_id) values('${results.insertId}','${element}')`
    //     );
    //   });
    // }

    // new query since sub cat is now single
    await conn.execute(
      `insert into ${config.env}.product_category(product_id,category_id) values('${results.insertId}','${productDetailById.categorybytag[0].id}')`
    );

    if (
      productDetailById.industry_id &&
      productDetailById.industry_id.length > 0
    ) {
      productDetailById.industry_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.industries_product_mapping(product_id,industry_id) values('${results.insertId}','${element}')`
        );
      });
    }
    if (productDetailById.brand_id) {
      `insert into ${config.env}.brands_product_mapping(product_id,brand_id) values('${results.insertId}','${productDetailById.brand_id}')`;
    }
    /////////////// end product by category/////////////////

    //////////////// insert similar together/////////////////
    if (
      productDetailById.relatedproduct_id &&
      productDetailById.relatedproduct_id.length > 0
    ) {
      productDetailById.relatedproduct_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_bought_together(product_id,sub_product_id) values('${results.insertId}','${element}')`
        );
      });
    }

    //////////////// end similar together/////////////////

    //////////////// insert alternative together/////////////////
    if (
      productDetailById.alternativeproduct_id &&
      productDetailById.alternativeproduct_id.length > 0
    ) {
      productDetailById.alternativeproduct_id.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_alternative_together(product_id,sub_product_id) values('${results.insertId}','${element}')`
        );
      });
    }

    //////////////// end alternative together/////////////////

    /* DO NOT INSERT ANYTHING RELATED TO IMAGES SINCE DUPLICATE BUCKET IMAGE ISSUE */
    //////////////// insert product images/////////////////
    if (
      productDetailById.product_media &&
      productDetailById.product_media.length > 0
    ) {
      productDetailById.product_media.forEach(async (element) => {
        await conn.execute(
          `insert into ${config.env}.product_media (uuid,product_id,media_url,priority,default_image)
        values('${element.uuid}','${results.insertId}','${element.path}','${element.priority}','${element.defaultimage}')`
        );
      });
    }

    //////////////// end product images/////////////////

    //////////////// insert default image/////////////////
    // await conn.execute(
    //   `update ${config.env}.product_media set default_image=1 where uuid='${req.defaultImage}'`
    // );
    //////////////// end default image/////////////////

    /* DO NOT INSERT ANYTHING RELATED TO IMAGES SINCE DUPLICATE BUCKET IMAGE ISSUE */
    //////////////// insert certificate data/////////////////
    if (
      productDetailById.product_certificate &&
      productDetailById.product_certificate.length > 0
    ) {
      productDetailById.product_certificate.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_certificate(product_id,uuid,certificate_name,certificate_image) values('${
            results.insertId
          }','${UUIDV4()}','${element.CertificateName}','${
            element.CertificateImage
          }')`
        );
      });
    }
    //////////////// end certificate data/////////////////

    /* DO NOT INSERT ANYTHING RELATED TO IMAGES SINCE DUPLICATE BUCKET IMAGE ISSUE */
    //////////////// insert document data/////////////////
    if (
      productDetailById.product_document &&
      productDetailById.product_document.length > 0
    ) {
      productDetailById.product_document.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_document(product_id,uuid,document_name,document_image) values('${
            results.insertId
          }','${UUIDV4()}','${element.DocumentName}','${
            element.DocumentImage
          }')`
        );
      });
    }
    //////////////// end document data/////////////////
    //////////////// insert Price data/////////////////
    if (
      productDetailById.product_price &&
      productDetailById.product_price.length > 0
    ) {
      productDetailById.product_price.forEach(async (element) => {
        await conn.execute(
          `insert into ${
            config.env
          }.product_price(sparky_id,manufacturer_id,product_id,uuid,product_quantity,product_price) values('${
            productDetailById.sparky_id
          }-duplicate-${totalDuplicates[0].total_duplicates}','${
            productDetailById.manufacturer_id
          }','${results.insertId}','${UUIDV4()}','${element.quantity}','${
            element.price
          }')`
        );
      });
    }
    //////////////// end Price data/////////////////
    conn.end();
    return [];
  } catch (e) {
    console.log("duplicate Product Data Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const dashboardData = async (req) => {
  console.log("dashboardData :::::::::::::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let totalSalesQuery = `select case WHEN isnull(sum(grandTotal)) then 0 ELSE  sum(totalAmount) END as totalSales from orders`;
    console.log("totalSalesQuery", totalSalesQuery);
    const [totalSales] = await conn.execute(totalSalesQuery);

    // let currentDate = moment().format("YYYY-MM-DD");
    let currentDate = moment().format("2024-02-14");
    // let todaySalesQuery = `select sum(totalAmount) as todaySales from orders where Date(createdAt) = '${currentDate}';`;
    let todaySalesQuery = `select case WHEN isnull(sum(grandTotal)) then 0 ELSE  sum(totalAmount) END as todaySales from orders where DATE(createdAt) = CURDATE();`;
    console.log("todaySalesQuery", todaySalesQuery);
    const [todaySales] = await conn.execute(todaySalesQuery);

    let totalOrdersQuery = `select count(1) as totalOrders from orders`;
    console.log("totalOrdersQuery", totalOrdersQuery);
    const [totalOrders] = await conn.execute(totalOrdersQuery);

    let totalPendingOrdersQuery = `select count(1) as totalPendingOrders from orders where status = 'pending'`;
    console.log("totalPendingOrdersQuery", totalPendingOrdersQuery);
    const [totalPendingOrders] = await conn.execute(totalPendingOrdersQuery);

    let totalShippedOrdersQuery = `select count(1) as totalShippedOrders from orders where status = 'shipped'`;
    console.log("totalShippedOrdersQuery", totalShippedOrdersQuery);
    const [totalShippedOrders] = await conn.execute(totalShippedOrdersQuery);

    let totalUsersQuery = `select count(1) as totalUsers from user`;
    console.log("totalUsersQuery", totalUsersQuery);
    const [totalUsers] = await conn.execute(totalUsersQuery);

    let totalUsersLoggedInQuery = `select count(1) as totalUsersLoggedIn from user where loginstatus=1`;
    console.log("totalUsersLoggedInQuery", totalUsersLoggedInQuery);
    const [totalUsersLoggedIn] = await conn.execute(totalUsersLoggedInQuery);

    let latestTransactionsQuery = `select * from orders order by createdAt desc LIMIT 10`;
    console.log("latestTransactionsQuery", latestTransactionsQuery);
    const [latestTransactions] = await conn.execute(latestTransactionsQuery);

    let newJoinMemberQuery = `select * from user order by created_at desc LIMIT 10`;
    console.log("newJoinMemberQuery", newJoinMemberQuery);
    const [newJoinMember] = await conn.execute(newJoinMemberQuery);

    let response = {
      totalSales: totalSales[0].totalSales,
      todaySales: todaySales[0].todaySales,
      totalOrders: totalOrders[0].totalOrders,
      totalPendingOrders: totalPendingOrders[0].totalPendingOrders,
      totalShippedOrders: totalShippedOrders[0].totalShippedOrders,
      totalUsers: totalUsers[0].totalUsers,
      totalUsersLoggedIn: totalUsersLoggedIn[0].totalUsersLoggedIn,
      latestTransactions: latestTransactions,
      newJoinMember: newJoinMember,
    };
    conn.end();
    return response;
  } catch (e) {
    console.log("getCustPreassembleTableData Error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassembleTableData:${e}`
    );
  }
};

const check = async (queryJson) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let response = queryJson;
    if (queryJson.sparky_id) {
      let query = `SELECT count(1) as total from product where sparky_id = '${queryJson.sparky_id}'`;
      console.log("query", query);
      let [queryResponse] = await conn.execute(query);
      console.log("queryResponse", queryResponse);
      if (queryResponse[0].total > 1) {
        response.sparky_id_details = `Sparky Id '${queryJson.sparky_id}' already exists`;
        response.sparky_id = true;
      } else {
        response.sparky_id_details = `Sparky Id '${queryJson.sparky_id}' does not exists`;
        response.sparky_id = false;
      }
    }
    return response;
  } catch (e) {
    console.log("check Error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error check:${e}`);
  }
};

module.exports = {
  GetLoginDetils,
  logout,
  getCategoryTableData,
  getCategoryTableCount,
  getSubCategoryTableData,
  getSubCategoryTableCount,
  getSubSubCategoryTableData,
  getSubSubCategoryTableCount,
  getCategorycmsData,
  saveCategory,
  updatecategory,
  saveSubSubCategory,
  updatesubsubcategory,
  getCategoryListData,
  getSimilarProductsData,
  getAlternativeProductsData,
  saveProductData,
  GetProductTableData,
  GetProductTableCount,
  updateProductData,
  saveMainBanner,
  updateMainBanner,
  getMainBannerData,
  getMainBannerCount,
  getBannerData,
  getBannerCount,
  updateBanner,
  deleteBannerData,
  getContentData,
  getContentCount,
  saveContentData,
  deleteContentData,
  updateContentData,
  getCategoryData,
  getFilterData,
  getFiltersAccordingToCategory,
  addFilterWithCategory,
  updateManageFilter,
  getSubCategoryTitleTableData,
  getSubCategoryTitleTableCount,
  updateManageSubcategoryTitle,
  deleteSubcategoryTitle,
  saveSubcategoryTitle,
  updateProductStockByExcel,
  getStockTable,
  getOrdersList,
  getOrdersListCount,
  getOrderDetails,
  getUserTableData,
  getUserTableCount,
  saveOrdersLogs,
  getOrderLogs,
  updateActiveUser,
  updateInactiveUser,
  GetProductExportData,
  updateErpNumber,
  getexportOrderList,
  GetProductDetailData,
  deleteProductData,
  getCreditMembersList,
  UpdateStatusCreditAccount,
  deleteSubCategory,
  deleteCategory,
  deleteFilter,
  uploadImage,
  deleteUploadImage,
  getIndustriesTable,
  getIndustriesTableCount,
  saveIndustry,
  deleteIndustry,
  updateIndustry,
  getBrandsTable,
  getBrandsTableCount,
  saveBrand,
  deleteBrand,
  updateBrand,
  getIndustriesListData,
  getBrandsListData,
  getCataloguesTable,
  getCataloguesTableCount,
  saveCatalogue,
  deleteCatalogue,
  updateCatalogue,
  getCmsUserTableData,
  getCmsUserTableCount,
  addCmsUser,
  activeCmsUser,
  inactiveCmsUser,
  uploadCustPreAssembleData,
  getParentCategoryListData,
  getCustPreassembleTableData,
  getCustPreassembleTableCount,
  deleteCMSUser,
  getQuotationsTableData,
  getQuotationsTableCount,
  getQuoteData,
  getAssemblySolutionsTable,
  getAssemblySolutionsTableCount,
  saveAssemblySolutions,
  deleteAssemblySolutions,
  crudVoucher,
  crudProductDiscount,
  getFilterNameList,
  getSectionList,
  getCableList,
  getTerminalList,
  getFiltersCount,
  crudProductFilters,
  createOrderInTLM,
  duplicateProduct,
  dashboardData,
  check,
};
