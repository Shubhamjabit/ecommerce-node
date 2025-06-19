const httpStatus = require("http-status");
// const tokenService = require('./token.service');
const {
  sendMailOrderConfirm,
  welcomeMailOnSignUp,
  sendEnquiryEmailToSparky,
  sendEnquiryEmailToCustomer,
  sendNotRegularProductEmail,
  sendNotRegularProductEmailToSparky,
} = require("../utils/emailService");
const config = require("../config/config");
const mysql = require("mysql2/promise");
const mssql = require("mssql");
const ApiError = require("../utils/ApiError");
const moment = require("moment-timezone");
const sql = require("mssql");
const UUIDV4 = require("uuid4");
const bcryptjs = require("bcryptjs");
const qpdf = require("node-qpdf");
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const Recipe = require("muhammara").Recipe;
const { Blob } = require("blob");
const { PDFDocument, rgb } = require("pdf-lib");

sgMail.setApiKey(config.sendgridKey);
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const { creditAccountMail } = require("../utils/emailService");
const uuid4 = require("uuid4");
const { default: axios } = require("axios");
const { func } = require("joi");
const {
  hashPasswordFunction,
  compareHashPassword,
  encryptFileFunction,
  convertBlobToFile,
  encryptPdf,
  convertFileToBlob,
  deleteFile,
} = require("./token.service");
const { json } = require("body-parser");
const getCategory = async () => {
  // console.log('In category');
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');
    // console.log(`SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level,'image_url',image_url,'meta_keywords',meta_keywords,'meta_title',meta_title,'meta_description',meta_description)) from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories,
    //   ( SELECT JSON_ARRAYAGG(JSON_OBJECT('filter_name',fm.filter_name,'id',fm.id)) FROM category_filter as cf left outer join filter_master as fm
    //   on cf.filter_id=fm.id where cf.sub_cate_id=c.parent_id) as category_filter
    //   FROM ${config.env}.category  as c where level=1`);

    //  const [results] = await conn.execute(
    //    `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level,'image_url',image_url,'meta_keywords',meta_keywords,'meta_title',meta_title,'meta_description',meta_description)) from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories,
    //    ( SELECT JSON_ARRAYAGG(JSON_OBJECT('filter_name',fm.filter_name,'id',fm.id,'sub_cate_id',cf.sub_cate_id)) FROM category_filter as cf left outer join filter_master as fm
    //    on cf.filter_id=fm.id where cf.cate_id=c.id ) as category_filter
    //  );

    // const [results] = await conn.execute(
    //   `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'parent_id',parent_id,'status',status,'name',name,'priority',priority,'level',level,'image_url',image_url,'meta_keywords',meta_keywords,'meta_title',meta_title,'meta_description',meta_description)) from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories,
    //   ( SELECT JSON_ARRAYAGG(JSON_OBJECT('filter_name',fm.filter_name,'id',fm.id,'sub_cate_id',cf.sub_cate_id)) FROM category_filter as cf left outer join filter_master as fm
    //   on cf.filter_id=fm.id where cf.cate_id=c.id ) as category_filter
    //   FROM ${config.env}.category  as c where level=1`
    // );

    // const [results] = await conn.execute(
    //   `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'parent_id',parent_id,'status',status,'name',name,'priority',priority,
    //   'level',level,'image_url',image_url,'meta_keywords',meta_keywords,'meta_title',meta_title,'meta_description',meta_description))
    //   from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories,
    //   ( SELECT DISTINCT JSON_ARRAYAGG(JSON_OBJECT('filter_id',cf.filter_id,'filter_name',fm.filter_name,'id',fm.id,'sub_cate_id',cf.sub_cate_id,
    //   'related_category',
    //   ( SELECT JSON_ARRAYAGG(JSON_OBJECT('id',cff.sub_cate_id,'id',ct.id,'parent_id',ct.parent_id,'status',ct.status,'name',ct.name,'priority',ct.priority,
    //   'level',ct.level,'image_url',ct.image_url,'meta_keywords',ct.meta_keywords,'meta_title',ct.meta_title,'meta_description',ct.meta_description))
    //   FROM category_filter as cff left outer join category as ct
    //   on ct.id=cff.sub_cate_id where cff.filter_id in (cf.filter_id) and cff.cate_id= c.id )
    //   ))
    //   FROM category_filter as cf left outer join filter_master as fm
    //   on cf.filter_id=fm.id where cf.cate_id=c.id) as category_filter
    //   FROM ${config.env}.category  as c where level=1`
    // );

    // const [results] = await conn.execute(
    //   `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',fm.id,'filter_name',fm.filter_name,'category_id',fm.category_id, 'related_category',
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('parent_id',cc.parent_id,'status',cc.status,'name',cc.name,'priority',cc.priority,
    //    'level',cc.level,'image_url',cc.image_url,'meta_keywords',cc.meta_keywords,'meta_title',cc.meta_title,'meta_description',cc.meta_description))
    //   from ${config.env}.category_filter as cf left outer join category as cc on cc.id = cf.sub_cate_id where fm.id = cf.filter_id ))
    //   )
    //   from ${config.env}.filter_master as fm where fm.category_id = c.id order by fm.id desc) category_filter
    //   FROM ${config.env}.category  as c where level=1 and status=1 order by c.priority asc `
    // );

    // query by ishaan for industries in Main DropDown =>
    const [results] = await conn.execute(
      `SELECT id,uuid,name,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',c.id,'name',c.name,'title',c.title,'priority',c.priority,'parent_id',c.parent_id,'status',c.status,'level',c.level,'meta_keywords',
      c.meta_keywords,'meta_title',c.meta_title,'meta_description',c.meta_description,'image_url',c.image_url,
      'category_filter',(SELECT JSON_ARRAYAGG(JSON_OBJECT('id',fm.id,'filter_name',fm.filter_name,'category_id',fm.category_id, 'related_category',
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('parent_id',cc.parent_id,'status',cc.status,'name',cc.name,'priority',cc.priority,
       'level',cc.level,'image_url',cc.image_url,'meta_keywords',cc.meta_keywords,'meta_title',cc.meta_title,'meta_description',cc.meta_description))
      from ${config.env}.category_filter as cf left outer join category as cc on cc.id = cf.sub_cate_id where fm.id = cf.filter_id and cc.status = 1 order by cc.priority))
      )
      from ${config.env}.filter_master as fm where fm.category_id = c.id order by fm.id desc)))
      from ${config.env}.category as c left join industries_category_mapping as icm on icm.category_id = c.id where im.id = icm.industry_id and c.status=1 order by c.priority) category_lsit
      FROM ${config.env}.industries_master as im where im.status = 1 order by im.priority`
    );
    // const [results] = await conn.execute(
    //   `SELECT id,name,priority,meta_keywords,meta_title,meta_description,level,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',uuid,
    //   'meta_description',meta_description,'meta_keywords',meta_keywords,
    //   'meta_title',meta_title,'name',name,'priority',priority,'level',level,'parent_id',parent_id,
    //   'sub_sub_categories',
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',uuid,
    //   'meta_description',meta_description,'meta_keywords',meta_keywords,
    //   'meta_title',meta_title,'name',name,'priority',priority,'level',level,'parent_id',parent_id,'title',title))
    //    from ${config.env}.category as cc2 where cc2.parent_id = cc.id)
    //   ))
    //    from ${config.env}.category as cc where cc.parent_id = c.id)  sub_categories
    //   FROM ${config.env}.category  as c where level=1`
    // );

    conn.end();
    return results;
  } catch (e) {
    console.log("In category error::::6", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};
const getCategoryList = async () => {
  // console.log('In category');
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url
      FROM ${config.env}.category as c where level=1 and status=1 order by c.priority asc`
    );
    conn.end();
    return results;
  } catch (e) {
    console.log("In category error::::6", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getCategoryBySlug = async (req) => {
  console.log("get Category By Slug :::::::::::::::::::::::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'parent_id',parent_id,'status',status,'name',name,'priority',priority,
       'level',level,'image_url',image_url,'meta_keywords',meta_keywords,'meta_title',meta_title,'meta_description',meta_description))
     from ${
       config.env
     }.category as cc where cc.parent_id = c.id and cc.status = 1)  sub_categories,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id',fm.id,'filter_name',fm.filter_name,'category_id',fm.category_id, 'related_category',
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('parent_id',cc.parent_id,'status',cc.status,'name',cc.name,'priority',cc.priority,
       'level',cc.level,'image_url',cc.image_url,'meta_keywords',cc.meta_keywords,'meta_title',cc.meta_title,'meta_description',cc.meta_description))
       
      from ${
        config.env
      }.category_filter as cf left outer join category as cc on cc.id = cf.sub_cate_id where fm.id = cf.filter_id ))
      )
      from ${
        config.env
      }.filter_master as fm where fm.category_id = c.id order by fm.id desc) category_filter
      FROM ${config.env}.category  as c where c.name like '%${req.slug.replace(
        /-/g,
        " "
      )}%' and level=1 and status=1 order by c.priority asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In get Category By Slug error::::", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getProductByCategory = async (req) => {
  console.log("get Product By Category >>>>>>>>>>>>>", req);
  try {
    let conn = "";
    let orderBy =
      req.order_by == "Default"
        ? "order by p.position"
        : req.order_by == "ID"
        ? " order by p.id desc"
        : req.order_by == "LOWPRICE"
        ? " order by p.price "
        : req.order_by == "HIGHPRICE"
        ? " order by p.price desc "
        : req.order_by == "NEWEST"
        ? " order by p.id desc "
        : " order by p.id desc";

    const minPrice = req.minimum_price;
    const maxPrice = req.maximum_price;
    // let pagefrom = req.page == 1 ? 0 : req.page * req.pageSize;
    let pagefrom = req.page == 1 ? 0 : req.pageSize * req.page - req.pageSize;
    // let subcat = req.slug.replaceAll("-", " "); // only in node v16
    let subcat = req.slug.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");
    subcat = subcat.replace("-", " ");

    // console.log(
    //   "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    //   subcat
    // );

    // console.log(`SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,slug,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list

    //   FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
    // left join ${config.env}.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1
    // and  p.price >= ${minPrice} and  p.price <= ${maxPrice}
    // ${orderBy}

    // LIMIT ${pagefrom}, ${req.pageSize}`);

    conn = await mysql.createConnection(config.mysqlDBConfig);
    var custmFilter1 = [];
    var custmFilter2 = [];
    var custmFilter3 = [];
    var custmFilter4 = [];
    var custmFilter5 = [];
    var custmFilter6 = [];
    var custmFilter7 = [];
    var custmFilter8 = [];
    if (
      !req.filter_by ||
      (req.filter_by &&
        Object.keys(req.filter_by).length == 3 &&
        req.filter_by.hasOwnProperty("page"))
    ) {
      console.log(`SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = p.id) category_hierarchy
        FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
      left join ${config.env}.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1 
      and  p.price >= ${minPrice} and  p.price <= ${maxPrice}
      ${orderBy} 
      
      LIMIT ${pagefrom}, ${req.pageSize}`);

      const [results] = await conn.execute(
        `SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = p.id) category_hierarchy
        FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
      left join ${config.env}.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1 
      and  p.price >= ${minPrice} and  p.price <= ${maxPrice}
      ${orderBy} 
      
      LIMIT ${pagefrom}, ${req.pageSize}`
      );
      conn.end();
      return results;
    } else if (req.filter_by) {
      let filterConditions = [];
    
      if (req.filter_by.custmFilter1) {
        custmFilter1 = req.filter_by.custmFilter1.split("+");
        filterConditions.push(`custmFilterNumber1 IN ('${custmFilter1.join("','")}')`);
      }
      if (req.filter_by.custmFilter2) {
        custmFilter2 = req.filter_by.custmFilter2.split("+");
        filterConditions.push(`custmFilterNumber2 IN ('${custmFilter2.join("','")}')`);
      }
      if (req.filter_by.custmFilter3) {
        custmFilter3 = req.filter_by.custmFilter3.split("+");
        filterConditions.push(`custmFilterNumber3 IN ('${custmFilter3.join("','")}')`);
      }
      if (req.filter_by.custmFilter4) {
        custmFilter4 = req.filter_by.custmFilter4.split("+");
        filterConditions.push(`custmFilterNumber4 IN ('${custmFilter4.join("','")}')`);
      }
      if (req.filter_by.custmFilter5) {
        custmFilter5 = req.filter_by.custmFilter5.split("+");
        filterConditions.push(`custmFilterNumber5 IN ('${custmFilter5.join("','")}')`);
      }
      if (req.filter_by.custmFilter6) {
        custmFilter6 = req.filter_by.custmFilter6.split("+");
        filterConditions.push(`custmFilterNumber6 IN ('${custmFilter6.join("','")}')`);
      }
      if (req.filter_by.custmFilter7) {
        custmFilter7 = req.filter_by.custmFilter7.split("+");
        filterConditions.push(`custmFilterNumber7 IN ('${custmFilter7.join("','")}')`);
      }
      if (req.filter_by.custmFilter8) {
        custmFilter8 = req.filter_by.custmFilter8.split("+");
        filterConditions.push(`custmFilterNumber8 IN ('${custmFilter8.join("','")}')`);
      }
    
      // Build the WHERE clause with `AND` for all provided filters
      const filterClause = filterConditions.length > 0 ? `AND ${filterConditions.join(" AND ")}` : "";
    
      console.log(`SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image, 'lifestyleImage', lifestyle)) 
         FROM product_media as pm 
         WHERE pm.product_id = p.id AND (pm.lifestyle=1 OR pm.default_image=1)) product_media_list,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid, 'name', name, 'slug', name)) 
         FROM product_category as pc 
         LEFT JOIN category as cc 
         ON pc.category_id = cc.id 
         WHERE pc.product_id = p.id) category_hierarchy
        FROM ${config.env}.product_category as pc 
        LEFT JOIN ${config.env}.category as c 
        ON pc.category_id = c.id
        LEFT JOIN ${config.env}.product as p 
        ON pc.product_id = p.id 
        WHERE c.name='${subcat}' 
        AND p.status = 1 
        AND p.price >= ${minPrice} 
        AND p.price <= ${maxPrice} 
        ${filterClause}
        ${orderBy}
        LIMIT ${pagefrom}, ${req.pageSize}`);

      // Backup code for the previous filter of OR 
      // const [results] = await conn.execute(
      //   `SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
      // (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
      // (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = p.id) category_hierarchy
      //   FROM ${config.env}.product_category as pc left join ${
      //     config.env
      //   }.category as c on pc.category_id=c.id
      // left join ${
      //   config.env
      // }.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1 
      // and  p.price >= ${minPrice} and  p.price <= ${maxPrice}
      // and  custmFilterNumber1 in ('${custmFilter1.join(
      //   "','"
      // )}') or  custmFilterNumber2 in ('${custmFilter2.join(
      //     "','"
      //   )}') or  custmFilterNumber3 in ('${custmFilter3.join(
      //     "','"
      //   )}') or  custmFilterNumber4 in ('${custmFilter4.join(
      //     "','"
      //   )}') or  custmFilterNumber5 in ('${custmFilter5.join(
      //     "','"
      //   )}') or  custmFilterNumber6 in ('${custmFilter6.join(
      //     "','"
      //   )}') or  custmFilterNumber7 in ('${custmFilter7.join(
      //     "','"
      //   )}') or  custmFilterNumber8 in ('${custmFilter8.join("','")}')
      // ${orderBy} 
      
      // LIMIT ${pagefrom}, ${req.pageSize}`
      // );

      const [results] = await conn.execute(
        `SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image, 'lifestyleImage', lifestyle)) 
         FROM product_media as pm 
         WHERE pm.product_id = p.id AND (pm.lifestyle=1 OR pm.default_image=1)) product_media_list,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid, 'name', name, 'slug', name)) 
         FROM product_category as pc
         LEFT JOIN category as cc 
         ON pc.category_id = cc.id 
         WHERE pc.product_id = p.id) category_hierarchy
        FROM ${config.env}.product_category as pc 
        LEFT JOIN ${config.env}.category as c 
        ON pc.category_id = c.id
        LEFT JOIN ${config.env}.product as p 
        ON pc.product_id = p.id 
        WHERE c.name='${subcat}' 
        AND p.status = 1 
        AND p.price >= ${minPrice} 
        AND p.price <= ${maxPrice} 
        ${filterClause}
        ${orderBy}
        LIMIT ${pagefrom}, ${req.pageSize}`
      );
      conn.end();
      return results;
    }
    
  } catch (e) {
    console.log("getProductByCategory Error===>>>>>>>>", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getProductDetails = async (req) => {
  let conn = "";
  console.log("getProductDetails req>>>>>>>>>", req);
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // conn.execute('SET SESSION group_concat_max_len = 10000');

    //     const [results] = await conn.execute(
    //       `select
    //       pp.id,'' star_rating, name,product_type,product_dimensions,product_key_features, slug, description, pallets,weight,cbm ,price, meta_description, meta_keyword, pp.sparky_id, pp.manufacturer_id,sm.stock,

    // (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pp.id) product_media,
    // (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pp.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
    // (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pp.id) category_hierarchy,
    //  ( SELECT JSON_ARRAYAGG(JSON_OBJECT('id', convert(uuid, CHAR), 'product_id', convert(pp.uuid, CHAR), 'star_rating', star_rating,'display_name', convert(display_name, CHAR), 'email_address', convert(email_address, CHAR),   'title', convert(title, CHAR), 'feedback', convert(feedback, CHAR), 'image', convert(image, CHAR), 'feedback_status', feedback_status, 'image_status', image_status)) from customer_review as cr  where cr.product_id = pp.id and cr.approved=1 and archive=0)  product_reviews,
    //  ( SELECT JSON_ARRAYAGG(JSON_OBJECT('slug',p.slug,'name',p.name,'id',p.id, 'product_media_list', ((SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pbt.sub_product_id and (pm.lifestyle=1  or pm.default_image=1))))) FROM product_bought_together as pbt left outer join product as p
    // on pbt.sub_product_id=p.id
    //  where pbt.product_id=pp.id) as bought_together
    //  ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('CertificateName',certificate_name,'CertificateImage',certificate_image,'UploadStatus',upload_status)) from product_certificate as pc where pc.product_id = pp.id) product_certificate
    // ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('DocumentName',document_name,'DocumentImage',document_image,'UploadStatus',upload_status)) from product_document as pd where pd.product_id = pp.id) product_document
    // ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pp.id) product_price

    //       from
    //  ${config.env}.product as pp inner join ${config.env}.stock_master sm on (pp.sparky_id = sm.sparky_id OR pp.id = sm.product_id) where pp.slug ='${req.slug}' and pp.status=1 `
    //     );
    const [results] = await conn.execute(`select
pp.id,pp.qty_per_pack,pp.qty_type,'' star_rating, name,product_type,product_dimensions,product_key_features, slug, description, pallets,weight,cbm ,price, meta_description, meta_keyword, pp.sparky_id, cable_pricing_permeter, terminal_1_id, terminal_2_id,pp.manufacturer_id,sm.stock,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from ${config.env}.product_media as pm where pm.product_id = pp.id) product_media,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from ${config.env}.product_media as pm where pm.product_id = pp.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from ${config.env}.product_category as pc left join ${config.env}.category as cc on pc.category_id=cc.id where pc.product_id = pp.id) category_hierarchy,
 ( SELECT JSON_ARRAYAGG(JSON_OBJECT('id', convert(uuid, CHAR), 'product_id', convert(pp.uuid, CHAR), 'star_rating', star_rating,'display_name', convert(display_name, CHAR), 'email_address', convert(email_address, CHAR),   'title', convert(title, CHAR), 'feedback', convert(feedback, CHAR), 'image', convert(image, CHAR), 'feedback_status', feedback_status, 'image_status', image_status)) from ${config.env}.customer_review as cr  where cr.product_id = pp.id and cr.approved=1 and archive=0)  product_reviews,
 ( SELECT JSON_ARRAYAGG(JSON_OBJECT('slug',p.slug,'name',p.name,'id',p.id, 'product_media_list', ((SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from ${config.env}.product_media as pm where pm.product_id = pbt.sub_product_id and (pm.lifestyle=1  or pm.default_image=1))),'priceJson',(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from ${config.env}.product_price as ppp where ppp.product_id = pbt.sub_product_id),'categoryHeirarchy',(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from ${config.env}.product_category as pc left join ${config.env}.category as cc on pc.category_id=cc.id where pc.product_id = pbt.sub_product_id))) FROM ${config.env}.product_bought_together as pbt left outer join product as p  
on pbt.sub_product_id=p.id
 where pbt.product_id=pp.id) as bought_together
 ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('CertificateName',certificate_name,'CertificateImage',certificate_image,'UploadStatus',upload_status)) from ${config.env}.product_certificate as pc where pc.product_id = pp.id) product_certificate
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('DocumentName',document_name,'DocumentImage',document_image,'UploadStatus',upload_status)) from ${config.env}.product_document as pd where pd.product_id = pp.id) product_document
,(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from ${config.env}.product_price as ppp where ppp.product_id = pp.id) product_price
,( SELECT JSON_ARRAYAGG(JSON_OBJECT('slug',p.slug,'name',p.name,'id',p.id, 'product_media_list', ((SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pat.sub_product_id and (pm.lifestyle=1  or pm.default_image=1))),'priceJson',(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pat.sub_product_id),'categoryHeirarchy',(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from ${config.env}.product_category as pc left join ${config.env}.category as cc on pc.category_id=cc.id where pc.product_id = pat.sub_product_id))) FROM product_alternative_together as pat left outer join product as p  
on pat.sub_product_id=p.id
 where pat.product_id=pp.id) as alternate_together
from  
${config.env}.product as pp inner join ${config.env}.stock_master sm on (pp.sparky_id = sm.sparky_id OR pp.id = sm.product_id) where pp.slug ='${req.slug}' and pp.status=1`);
    // console.log(results)
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const getProductByCategoryTotal = async (req) => {
  console.log("get Product By Category Total >>>>>>>>>>>>>", req);
  try {
    let conn = "";

    conn = await mysql.createConnection(config.mysqlDBConfig);

    if (req.level == "2") {
      let subcat = req.slug.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      var custmFilter1 = [];
      var custmFilter2 = [];
      var custmFilter3 = [];
      var custmFilter4 = [];
      var custmFilter5 = [];
      var custmFilter6 = [];
      var custmFilter7 = [];
      var custmFilter8 = [];
      if (
        !req.filter_by ||
        (req.filter_by &&
          Object.keys(req.filter_by).length == 3 &&
          req.filter_by.hasOwnProperty("page"))
      ) {
        const [results] = await conn.execute(
          `Select count(*) as total FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
      left join ${config.env}.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1`
        );
        conn.end();
        return results;
      } else if (req.filter_by) {
        if (req.filter_by.custmFilter1) {
          custmFilter1 = req.filter_by.custmFilter1.split("+");
        }
        if (req.filter_by.custmFilter2) {
          custmFilter2 = req.filter_by.custmFilter2.split("+");
        }
        if (req.filter_by.custmFilter3) {
          custmFilter3 = req.filter_by.custmFilter3.split("+");
        }
        if (req.filter_by.custmFilter4) {
          custmFilter4 = req.filter_by.custmFilter4.split("+");
        }
        if (req.filter_by.custmFilter5) {
          custmFilter5 = req.filter_by.custmFilter5.split("+");
        }

        if (req.filter_by.custmFilter6) {
          custmFilter6 = req.filter_by.custmFilter6.split("+");
        }
        if (req.filter_by.custmFilter7) {
          custmFilter7 = req.filter_by.custmFilter7.split("+");
        }
        if (req.filter_by.custmFilter8) {
          custmFilter8 = req.filter_by.custmFilter8.split("+");
        }

        const [results] = await conn.execute(
          `Select count(*) as total FROM ${
            config.env
          }.product_category as pc left join ${
            config.env
          }.category as c on pc.category_id=c.id
          left join ${
            config.env
          }.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1  
            and  custmFilterNumber1 in ('${custmFilter1.join(
              "','"
            )}') or  custmFilterNumber2 in ('${custmFilter2.join(
            "','"
          )}') or  custmFilterNumber3 in ('${custmFilter3.join(
            "','"
          )}') or  custmFilterNumber4 in ('${custmFilter4.join(
            "','"
          )}') or  custmFilterNumber5 in ('${custmFilter5.join(
            "','"
          )}') or  custmFilterNumber6 in ('${custmFilter6.join(
            "','"
          )}') or  custmFilterNumber7 in ('${custmFilter7.join(
            "','"
          )}') or  custmFilterNumber8 in ('${custmFilter8.join("','")}')`
        );
        conn.end();
        return results;
      }
    } else if (req.pageSize > 4) {
      const [results] = await conn.execute(
        `Select count(*) as total FROM  ${config.env}.product as p  where p.name like '%${req.keyword}%'  and  p.status=1`
      );
      conn.end();
      return results;
    }
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getMainBanner = async (req) => {
  let currentdate = moment()
    .tz("Australia/Sydney")
    .format("YYYY-MM-DD HH:mm:ss");
  try {
    let conn = "";
    // console.log('<<<<<<<<<===  Banner ===>>>>>>>>', req);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select  id,link_url,image,title from ${config.env}.main_banner where status='1' and from_date <= '${currentdate}' and to_date > '${currentdate}' order by position asc`
    );
    conn.end();
    return results;
  } catch (e) {
    console.log("get Main Banner Error >>>>>>>>>>>>>>>", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getOtherBanner = async (req) => {
  try {
    let conn = "";
    // console.log('<<<<<<<<<===  Banner ===>>>>>>>>', req);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select  id,link_url,image,title from ${config.env}.banner where status='1'`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getContentData = async (req) => {
  console.log("In content data@@@@@@@@@@@@@@@@@", req.slug);
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select id,page_title,page_content,meta_title,meta_description,meta_keyword from ${config.env}.content_page where status='1' and page_url='${req.slug}'`
    );
    conn.end();
    return results;
  } catch (e) {
    console.log("Content Error >>>>>>>>>>>>>>>", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

// const getSubCategory = async (req) => {
//   console.log("In Get Sub Category data@@@@@@@@@@@@@@@@@", req.filter_id);
//   try {
//     let conn = "";
//     conn = await mysql.createConnection(config.mysqlDBConfig);
//     const [results] = await conn.execute(
//       `select id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url from ${config.env}.category`
//     );
//     conn.end();
//     return results;
//   } catch (e) {
//     console.log("Content Error >>>>>>>>>>>>>>>", e);
//     conn.end();
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
//   }
// };

const getSubCategory = async (req) => {
  console.log("Get Sub Category data :::::::::::", req.filter_id);
  let Filterloop = req.filter_id;
  let FilterID = "";
  let count = Filterloop.length - 1;
  if (Filterloop.length > 0) {
    Filterloop.forEach((i) => {
      FilterID += i.id + ",";
    });

    FilterID = FilterID.slice(0, FilterID.length - 1);
  }
  //count = v.lenght;
  let conn = "";
  let sql = "";
  console.log("Get Sub Category data ::::::::::: count :::::::", count);
  try {
    sql = `SELECT c.id,name,title,priority,parent_id,status,level,meta_keywords,meta_title,meta_description,image_url

      FROM ${config.env}.category as c left join category_filter as cf on c.id=cf.sub_cate_id where 1=1 and c.status = 1`;
    conn = await mysql.createConnection(config.mysqlDBConfig);

    if (FilterID.length > 0) {
      sql += ` and cf.filter_id in (${FilterID}) group by  cf.sub_cate_id having count(1)>(${count})`;
    }
    const [results] = await conn.execute(sql);
    console.log("Get Sub Category results >>>>>>>>>>>>>>>", results);
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("Get Sub Category Error >>>>>>>>>>>>>>>", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const registerSaveData = async (req) => {
  // console.log("Get registerSaveData data :::::::::::", req);
  let conn = "";

  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let serviceResponse = { state: true, message: "sucess" };
    const [userExists] = await conn.execute(
      `select count(*) as email from ${config.env}.user WHERE email = '${req.email}'`
    );
    // console.log("Get userExists :::::::::::", userExists);
    // console.log("Get userExists :::::::::::", userExists[0].email);
    if (userExists[0].email > 0) {
      serviceResponse.state = false;
      serviceResponse.message = "User Already Exist";
      // console.log("Get userExists :::::::::::");
    } else {
      // console.log("Set User Data :::::::::::");
      // const [results] = await conn.execute(
      //   `insert into ${config.env}.user
      // (uuid,email,first_name,last_name,password,phone)
      //   values('${UUIDV4()}','${req.email}','${req.firstName}','${
      //     req.lastName
      //   }','${req.password}','${req.phone}')`
      // );
      // let hashPassword = null;

      // var salt = bcryptjs.genSaltSync(10);
      // var hash = bcryptjs.hashSync(req.password, salt);
      // hashPassword = hash;
      const hashPassword = await hashPasswordFunction(req.password);
      console.log("hhhhhhhhh hashPassword", hashPassword);
      const [results] = await conn.query(
        `insert into ${
          config.env
        }.user (uuid,email,first_name,last_name,hashPassword,phone,state,companyname,companyabn,segment,industry,description )
      values (
        '${UUIDV4()}',
        '${req.email}',
        '${req.firstName}',
        '${req.lastName}',
        '${hashPassword}',
        '${req.phone}',
        '${req.state}',
        '${req.companyName}',
        '${req.companyabn}',
        '${req.segment}',
        '${req.industry}',
        '${req.description}')`
      );

      serviceResponse.state = true;
      serviceResponse.message = "sucess";
    }
    conn.end();
    const emailJson = {
      email: req.email,
      customer_name: req.firstName + " " + req.lastName,
    };
    await welcomeMailOnSignUp(emailJson);
    return serviceResponse;
  } catch (e) {
    conn.end();
    console.log("Get registerSaveData Error >>>>>>>>>>>>>>>", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const loginUserWithEmailAndPassword = async (req) => {
  console.log("Get loginUserWithEmailAndPassword data :::::::::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `select id,email,first_name,last_name,hashPassword,phone,status,cust_product_count  from  ${config.env}.user  WHERE  email = '${req.email}'`
    );
    // const [results] = await conn.execute(
    //   `select id,email,first_name,last_name,password,phone,status  from  ${config.env}.user  WHERE  email = '${req.email}' AND  password = '${req.password}'`
    // );

    console.log("results Query executed >>>>>>>>>>>>>>:", results);
    if (results[0]?.email) {
      const isMatch = await compareHashPassword(
        req.password,
        results[0].hashPassword
      );
      // const isMatch = bcryptjs.compareSync(
      //   req.password,
      //   results[0].hashPassword
      // );
      console.log("isMatch", isMatch);
      if (isMatch) {
        await conn.execute(
          `update  ${config.env}.user set loginstatus = 1  WHERE  email = '${req.email}' AND  hashPassword = '${results[0].hashPassword}'`
        );
        const [resultsTwo] = await conn.execute(
          `select u.id,email,first_name as firstName,last_name as lastName,phone as phone_number,u.status,loginstatus, c.status as credit_status,c.creditLimit,c.creditBalance from  ${config.env}.user u left join ${config.env}.credit_members_forms c on u.id = c.user_id WHERE  email = '${req.email}' AND  hashPassword = '${results[0].hashPassword}' and u.status=1`
        );
        console.log(
          "results Query executed 222222222444444444444>>>>>>>>>>>>>>:",
          resultsTwo
        );
        // if not applied for credit
        // if (results.length == 0) {
        //   const [results] = await conn.execute(
        //     `select id,email,first_name as firstName,last_name as lastName,phone as phone_number,status,loginstatus from  ${config.env}.user  WHERE email = '${req.email}' AND  password = '${req.password}' and status=1`
        //   );
        //   await conn.close();
        //   return results;
        // } else {
        //   await conn.close();
        //   return results;
        // }
        await conn.close();
        return resultsTwo;
      }
      // else if (!isMatch && req.password == results[0].password) {
      //   await conn.execute(
      //     `update  ${config.env}.user set loginstatus = 1  WHERE  email = '${req.email}' AND  password = '${req.password}'`
      //   );
      //   const [results] = await conn.execute(
      //     `select u.id,email,first_name as firstName,last_name as lastName,phone as phone_number,u.status,loginstatus, c.status as credit_status,c.creditLimit,c.creditBalance from  ${config.env}.user u left join ${config.env}.credit_members_forms c on u.id = c.user_id WHERE  email = '${req.email}' AND  password = '${req.password}' and u.status=1`
      //   );
      //   console.log(
      //     "results Query executed 2222222225555555555>>>>>>>>>>>>>>:",
      //     results
      //   );
      //   // // if not applied for credit
      //   // if (results.length == 0) {
      //   //   const [results] = await conn.execute(
      //   //     `select id,email,first_name as firstName,last_name as lastName,phone as phone_number,status,loginstatus from  ${config.env}.user  WHERE email = '${req.email}' AND  password = '${req.password}' and status=1`
      //   //   );
      //   //   await conn.close();
      //   //   return results;
      //   // } else {
      //   //   await conn.close();
      //   //   return results;
      //   // }
      //   await conn.close();
      //   return results;
      // }
      else {
        await conn.close();
        return [];
      }
    } else {
      await conn.close();
      return "User does not exist";
    }
  } catch (error) {
    console.log("In loginUserWithEmailAndPassword Error ::::::::::", error);

    await conn.close();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const getUserDetailsFromDB = async (req) => {
  //console.log("Get loginUserWithEmailAndPassword data :::::::::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    // const [results] = await conn.execute(
    //   `select id,email,first_name,last_name,password,phone,status  from  ${config.env}.user  WHERE  email = '${req.email}' AND  password = '${req.password}'`
    // );

    // //console.log("results Query executed >>>>>>>>>>>>>>:", results);
    // if (results[0].email) {
    //   await conn.execute(
    //     `update  ${config.env}.user set loginstatus = 1  WHERE  email = '${req.email}' AND  password = '${req.password}'`
    //   );
    const [results] = await conn.execute(
      `select u.id,email,u.cust_product_count,first_name as firstName,last_name as lastName,phone as phone_number,u.status,loginstatus, c.status as credit_status,c.creditLimit,c.creditBalance, 
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('voucherId',v.id,'voucherName',v.voucherName,'minCartAmount',v.minCartAmount,'isMultiple',v.isMultiple, 'maxNumberUsage',v.maxNumberUsage, 'amountType',v.amountType, 'flatAmount',v.flatAmount,'discountPercentage',v.discountPercentage,'maxAmountIfPercentage',v.maxAmountIfPercentage,'startDateTime',v.startDateTime,'expiryDateTime',v.expiryDateTime))  from ${config.env}.email_vouchers v  left join ${config.env}.user u on u.email = v.custEmailId  WHERE v.custEmailId = '${req.email}' and v.startDateTime <= CONVERT_TZ(now(),'+00:00','+10:00') and v.expiryDateTime > CONVERT_TZ(now(),'+00:00','+10:00')) as vouchersJson
      ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('productDiscountId',d.id,'discountName',d.discountName,'discountPercentage',d.discountPercentage,'startDateTime',d.startDateTime,'expiryDateTime',d.expiryDateTime))  from ${config.env}.email_product_discount d left join ${config.env}.user u on u.email = d.custEmailId  WHERE d.custEmailId = '${req.email}' and d.startDateTime <= CONVERT_TZ(now(),'+00:00','+10:00') and d.expiryDateTime > CONVERT_TZ(now(),'+00:00','+10:00')) as productsDiscountJson
      from  ${config.env}.user u left join ${config.env}.credit_members_forms c on u.id = c.user_id 
      left join ${config.env}.email_vouchers v on v.custEmailId = u.email
      left join ${config.env}.email_product_discount d on d.custEmailId = u.email
      WHERE  email = '${req.email}'`
    );
    // if not applied for credit
    if (results.length == 0) {
      const [results] = await conn.execute(
        `select id,email,cust_product_count,first_name as firstName,last_name as lastName,phone as phone_number,status,loginstatus from  ${config.env}.user WHERE  email = '${req.email}'`
      );
      await conn.close();
      return results;
    }
    await conn.close();

    return results;
    // }
    // await conn.close();

    // return [];
  } catch (error) {
    console.log("In getUserDetailsFromDB Error ::::::::::", error);

    // await conn.close();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const updateProfile = async (req) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    await conn.execute(
      `update ${config.env}.user set 
        first_name='${req.fname}'
        ,last_name='${req.lname}'
        ,phone='${req.phone}'
         where email='${req.email}'`
    );

    conn.end();

    return [];
  } catch (e) {
    console.log("In update Profile Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};
const resetPasswordSubmit = async (email, newPassword) => {
  console.log("reset Password Submit ::::", email, newPassword);
  const hashPassword = await hashPasswordFunction(newPassword);
  let conn = "";
  try {
    conn = await new mysql.createConnection(config.mysqlDBConfig);
    console.log(`update ${config.env}.user set 
    hashPassword = '${hashPassword}',
     where email='${email}'`);
    const resetResult = await conn.execute(
      `update ${config.env}.user set 
        hashPassword = '${hashPassword}'
         where email='${email}'`
    );

    await conn.close();
    return resetResult;
  } catch (error) {
    console.log("resetPasswordSubmit Error =>", error);
    await conn.close();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Password reset failed"
    );
  }
};

const logout = async (email) => {
  console.log("--in logout service :--:", email);
  let conn = "";
  conn = await new mysql.createConnection(config.mysqlDBConfig);
  await conn.execute(
    `update  ${config.env}.user set loginstatus = 0  WHERE  email = '${email}'`
  );
  // await logUserActivity(email, "SIGN-OUT", "SUCCESS", "LOGOUT");
};

const checkloginStatus = async (req) => {
  //console.log("check login Status :::::::::::::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    //console.log("results Query executed >>>>>>>>>>>>>>:", results);
    if (req.email) {
      const [results] = await conn.execute(
        `select status,loginstatus  from  ${config.env}.user  WHERE  email = '${req.email}'`
      );
      await conn.close();

      return results;
    }
    await conn.close();

    return [];
  } catch (error) {
    console.log("In check login Status Error ::::::::::", error);

    // await conn.close();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const productSearch = async (req) => {
  try {
    console.log("product Search :::::::::", req);
    let pageSize = req.pageSize == 4 ? req.pageSize : 10000000000;

    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // const [results] = await conn.execute(
    //   `SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
    //   (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list

    //     FROM   ${config.env}.product as p
    //      where p.status=1  and p.name like '%${req.keyword}%' or p.sku like '%${req.keyword}%' order by p.name LIMIT ${pageSize}`
    // );
    // new query for better product search
    const [results] = await conn.execute(
  `SELECT p.id, p.name, p.price, p.price-((p.price*p.discount_percentage)/100) as discount_price, 
          p.price-((p.price*(p.discount_percentage + 5))/100) membership_price, discount_percentage, slug,
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image, 'lifestyleImage', lifestyle)) 
        FROM product_media as pm 
        WHERE pm.product_id = p.id AND (pm.lifestyle=1 OR pm.default_image=1)
    ) product_media_list
    FROM ${config.env}.product as p
    WHERE p.status=1 AND (
        p.name LIKE REPLACE('${req.keyword}%', ' ', '%')
        OR p.sku LIKE REPLACE('${req.keyword}%', ' ', '%')
        OR p.sparky_id LIKE REPLACE('${req.keyword}%', ' ', '%')
        OR p.manufacturer_id LIKE REPLACE('${req.keyword}%', ' ', '%')
    )
    ORDER BY p.name 
    LIMIT ${pageSize}`
);
    console.log("rrrrrr", results);
    // if still results 0, search more
    if (results.length == 0) {
      const [results] = await conn.execute(
        `SELECT p.id,p.name,p.price,p.price-((p.price*p.discount_percentage)/100) as discount_price,p.price-((p.price*(p.discount_percentage + 5))/100) membership_price,discount_percentage,slug,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = p.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list

        FROM   ${config.env}.product as p
         where p.status=1  and p.name like REPLACE('%${req.keyword}%'," ","%") or p.sku like REPLACE('%${req.keyword}%'," ","%") order by p.name LIMIT ${pageSize}`
      );
      conn.end();
      return results;
    }
    conn.end();
    return results;
  } catch (e) {
    console.log("product Search Error===>>>>>>>>", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getProdTotal = async (req) => {
  try {
    let conn = "";

    conn = await mysql.createConnection(config.mysqlDBConfig);

    if (req.level == "1") {
      let cat = req.slug.replace("-", " ");

      const [results] = await conn.execute(
        `Select count(*) as total FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
      left join ${config.env}.product as p on pc.product_id=p.id where c.name='${cat}' and  p.status=1`
      );
      conn.end();
      return results;
    } else if (req.level == "2") {
      let subcat = req.slug.replace("-", " ");
      subcat = subcat.replace("-", " ");
      subcat = subcat.replace("-", " ");
      const [results] = await conn.execute(
        `Select count(*) as total FROM ${config.env}.product_category as pc left join ${config.env}.category as c on pc.category_id=c.id
      left join ${config.env}.product as p on pc.product_id=p.id where c.name='${subcat}' and  p.status=1`
      );
      conn.end();
      return results;
    } else if (req.pageSize > 4) {
      const [results] = await conn.execute(
        `Select count(*) as total FROM  ${config.env}.product as p  where p.name like '%${req.keyword}%'  and  p.status=1`
      );
      conn.end();
      return results;
    }
  } catch (e) {
    console.log("product Details Id Error===>>>>>>>>", e);

    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getPopularProducts = async (req) => {
  try {
    let conn = "";
    // console.log('<<<<<<<<<===  Banner ===>>>>>>>>', req);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // const [results] = await conn.execute(
    //   `SELECT p.*, pm.media_url, pm.priority, pm.default_image FROM ${config.env}.product p
    //   INNER JOIN ${config.env}.product_media pm ON p.id = pm.product_id where p.status = 1 order by RAND () LIMIT 24`
    // );
    const [results] = await conn.execute(
      `SELECT p.*, pm.media_url, pm.priority, pm.default_image,ptm.order_no order_no FROM product p
     INNER JOIN product_media pm ON p.id = pm.product_id 
     INNER JOIN product_tag_map ptm on p.id = ptm.product_id
     where p.status = 1
     and ptm.tag_id = 1 
     UNION
     SELECT p.*, pm.media_url, pm.priority, pm.default_image, IFNULL(ptm.order_no, 999999) order_no FROM product p
     INNER JOIN product_media pm ON p.id = pm.product_id
     left JOIN product_tag_map ptm on p.id = ptm.product_id
     where p.status = 1 
     order by order_no asc
     LIMIT 24`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getIndustriesList = async (req) => {
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `SELECT id,name,priority,imgUrl FROM ${config.env}.industries_master 
      where status = 1`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getIndustriesList:${error}`
    );
  }
};

const getAssemblySolutionsList = async (req) => {
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [results] = await conn.execute(
      `SELECT id,name,priority FROM ${config.env}.category 
      where status = 1 and isAssemblySolutions = 1 and parent_id=0`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getAssemblySolutionsList:${error}`
    );
  }
};

const saveFinalOrder = async (req) => {
  console.log("req.body in saveFinalOrder ==========>", req);
  try {
    const resultData = {
      orderId: "",
      invoiceId: "",
      status: 0,
      emailid: "",
    };

    let conn = "";
    let sqlconn = "";
    let customer = req.data.customerData;
    let payment = req.data.paymentInfo;
    let ordersData = req.data.ordersData;
    // console.log("ordersData ================>", ordersData);
    let cartItems = req.data.ordersData.cartItems;
    // console.log("cartItmes ================>", cartItems);
    let coupon = req.discount_code;
    let appliedVoucherObj = req.data.appliedVoucherObj;
    console.log("appliedVoucherObj ================>", appliedVoucherObj);
    let externalReference = 0;

    let ismembership = req.buy_membership ? true : false;

    const mainTotalPrice = {
      ShippingInformation: req.ShippingInformation,
      buy_membership: req.buy_membership,
      cart: req.cartData,
      discount_code: req.discount_code,
      userData: req.userData,
    };

    // const resultTotalAmount = await getMemberPriceProductCalculationData(
    //   mainTotalPrice
    // );

    // console.log(
    //   "Result from getMemberPriceProductCalculation::>>>>>>>>>>>>>>>",
    //   resultTotalAmount
    // );

    /*
    const items_price = resultTotalAmount[0].items_price;
    const applied_discount_code = resultTotalAmount[0].applied_discount_code;
    const amount_without_voucher = resultTotalAmount[0].amount_without_voucher;
    const total_price = resultTotalAmount[0].total_price;
    const shipping_price = resultTotalAmount[0].shipping_price;
    */

    // let custid = Math.floor(
    //   32467865132132465 + Math.random() * 21231456763213248465
    // );
    // let orderid = Math.floor(
    //   32467865132132465 + Math.random() * 21231456763213248465
    // );

    // let uuidd = 0;

    let totalOrder = 10000;
    let totalTax = 1000;

    let custUUID = UUIDV4();
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    /* externalReference generation using date and UUID
    // prints date & time in YYYY-MM-DD format
    let fullDate = year + "-" + month + "-" + date;
    let externalReferenceUUID = UUIDV4();
    externalReference = fullDate + "-" + externalReferenceUUID;
    console.log("externalReference = ", externalReference);
    */

    const todayDate = moment().format("YYMMDD");

    /*
    // start - externalReference generation using date and random 4 digit number
    let randomNumber = Math.floor(3246 + Math.random() * 2123);
    let fullDate = date.toString() + month.toString() + year.toString();
    externalReference = fullDate + randomNumber.toString();
    //end
    */
    externalReference = `${todayDate}${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    let ordersUUID = UUIDV4();
    let orderPaymentsUUID = UUIDV4();

    // console.log("cust uuid", custUUID);
    // console.log("externalReferenceUUID ", externalReferenceUUID);
    // console.log("ordersUUID ", ordersUUID);
    // console.log("orderPaymentsUUID ", orderPaymentsUUID);

    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [isExists] = await conn.execute(
      `SELECT count(1) tot FROM  ${config.env}.user where email ='${customer.email}' `
    );

    // check for if customer Exists, if yes, assign cust uuid
    if (isExists[0].tot !== 0) {
      console.log("CUSTOMER EXISTS!", custUUID);
      const [custData] = await conn.execute(
        `SELECT id,uuid FROM  ${config.env}.user where  email ='${customer.email}' `
      );
      custUUID = custData[0].uuid;
      var custId = custData[0].id;
    } else {
      custUUID = "unregistered_user";
    }

    // console.log("custUUID DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", custUUID);
    console.log("cust id ", custId);

    /*
    if (isExists[0].tot == 0) {
      await conn.execute(
        `INSERT INTO ${config.env}.Customers
      (id,
      firstName,
      lastName,
      mobile,
      phone,
      email,
      deliveryAddressStreet,
      deliveryAddressSuburb,
      deliveryAddressState,
      deliveryAddressPostcode,
      deliveryAddressCountry,
      createdAt,
      updatedAt,
      lastPurchaseDate,
      billingAddressStreet,
      billingAddressSuburb,
      billingAddressState,
      billingAddressPostcode,
      billingAddressCountry
      ) values('${custUUID}', '${customer.firstName}','${customer.lastName}','${customer.phoneNumber}','${customer.phoneNumber}'
      ,'${customer.email}'
      ,'${customer.streetAddress}','${customer.city}','${customer.state}','${customer.postCode}'
      ,'${customer.country}'
      ,now(),now(),now(),'${customer.billingStreetAddress}','${customer.billingCity}','${customer.billingState}','${customer.billingPostCode}','${customer.billingCountry}')`
      );
    } else {
      const [custData] = await conn.execute(
        `SELECT id FROM  ${config.env}.Customers where  email ='${customer.email}' `
      );
      custUUID = custData[0].id;
    }
    */
    // return;
    console.log(`INSERT INTO ${config.env}.Customers
    (id,
    cust_uuid,
    firstName,
    lastName,
    mobile,
    phone,
    email,
    deliveryAddressStreet,
    deliveryAddressSuburb,
    deliveryAddressState,
    deliveryAddressPostcode,
    deliveryAddressCountry,
    createdAt,
    updatedAt,
    lastPurchaseDate,
    billingAddressStreet,
    billingAddressSuburb,
    billingAddressState,
    billingAddressPostcode,
    billingAddressCountry,
    billing_fName,
    billing_lName,
    billing_email,
    billing_mobile
    ) values('${ordersUUID}','${custUUID}', '${customer.firstName}','${customer.lastName}','${customer.phoneNumber}','${customer.phoneNumber}'
    ,'${customer.email}'
    ,'${customer.streetAddress}','${customer.city}','${customer.state}','${customer.postCode}'
    ,'${customer.country}'
    ,now(),now(),now(),'${customer.billingStreetAddress}','${customer.billingCity}','${customer.billingState}','${customer.billingPostCode}','${customer.billingCountry}','${customer.billingFirstName}','${customer.billingLastName}','${customer.billingEmail}','${customer.billingMobile}')`);

    await conn.execute(
      `INSERT INTO ${config.env}.Customers
        (id,
        cust_uuid,
        firstName,
        lastName,
        mobile,
        phone,
        email,
        deliveryAddressStreet,
        deliveryAddressSuburb,
        deliveryAddressState,
        deliveryAddressPostcode,
        deliveryAddressCountry,
        createdAt,
        updatedAt,
        lastPurchaseDate,
        billingAddressStreet,
        billingAddressSuburb,
        billingAddressState,
        billingAddressPostcode,
        billingAddressCountry,
        billing_fName,
        billing_lName,
        billing_email,
        billing_mobile
        ) values('${ordersUUID}','${custUUID}', '${customer.firstName}','${customer.lastName}','${customer.phoneNumber}','${customer.phoneNumber}'
        ,'${customer.email}'
        ,'${customer.streetAddress}','${customer.city}','${customer.state}','${customer.postCode}'
        ,'${customer.country}'
        ,now(),now(),now(),'${customer.billingStreetAddress}','${customer.billingCity}','${customer.billingState}','${customer.billingPostCode}','${customer.billingCountry}','${customer.billingFirstName}','${customer.billingLastName}','${customer.billingEmail}','${customer.billingMobile}')`
    );
    // console.log(`INSERT INTO ${config.env}.Orders
    //   (id,
    //     externalReference,
    //     invoiceID,
    //   createdDate,
    //   deliveryCharge,
    //   freightCost,
    //   totalAmount,
    //   totalTaxes,
    //   totalDiscount,
    //   grandTotal,
    //   paymentStatus,
    //   initiatiedBy,
    //   customerFName,
    //   customerLName,
    //   customerEmail,
    //   customerPhone,
    //   customerMobile,
    //   createdAt,
    //   updatedAt,
    //   syncStatus,
    //   customerID, status,
    //   erpNumber,is_quoted,quote_id) values('${ordersUUID}','${externalReference}','${
    //   ordersData.invoiceId
    // }',now(),'${ordersData.shippingAmount}','${ordersData.shippingAmount}','${
    //   ordersData.subAmount
    // }',null,null,'${ordersData.totalAmount}','paid','WEB','${
    //   customer.firstName
    // }','${customer.lastName}',
    //   '${customer.email}','${customer.phoneNumber}','${customer.phoneNumber}',
    //       now(),now(),'cyrus=success','${custUUID}','Pending','',${
    //   ordersData.isQuoted ? 1 : 0
    // }, ${ordersData.isQuoted ? `'${ordersData.quoteId}'` : null})`);

    // console.log(` INSERT INTO ${config.env}.Orders
    // (id,
    //   externalReference,
    //   invoiceID,
    // createdDate,
    // deliveryCharge,
    // freightCost,
    // totalAmount,
    // voucherId,
    // voucherDiscountAmount,
    // creditAmount,
    // totalTaxes,
    // totalDiscount,
    // grandTotal,
    // grandTotalAfterCredit,
    // paymentStatus,
    // initiatiedBy,
    // customerFName,
    // customerLName,
    // customerEmail,
    // customerPhone,
    // customerMobile,
    // createdAt,
    // updatedAt,
    // syncStatus,
    // customerID, status,
    // erpNumber,is_quoted,quote_id,delivery_instructions,total_items,total_pallets,total_weight,total_cbm,shippingOption) values('${ordersUUID}','${externalReference}','${
    //   ordersData.invoiceId
    // }',now(),'${ordersData.shippingAmount}','${ordersData.shippingAmount}','${
    //   ordersData.subAmount
    // }',${appliedVoucherObj ? appliedVoucherObj.voucherId : null},${
    //   appliedVoucherObj
    //     ? appliedVoucherObj.amountType == 0
    //       ? appliedVoucherObj.flatAmount
    //       : appliedVoucherObj.amountTobeDeductedIfPercentage
    //     : null
    // },${ordersData.creditAmount ? ordersData.creditAmount : null},null,null,'${
    //   ordersData.totalAmount
    // }',${
    //   ordersData.totalAmountAfterCredit
    //     ? ordersData.totalAmountAfterCredit
    //     : null
    // },'paid','WEB','${customer.firstName}','${customer.lastName}',
    // '${customer.email}','${customer.phoneNumber}','${customer.phoneNumber}',
    //     now(),now(),'cyrus=success','${custUUID}','Pending','',${
    //   ordersData.isQuoted ? 1 : 0
    // }, ${ordersData.isQuoted ? ordersData.quoteId : null}, ${
    //   ordersData.deliveryInstructions
    // }, ${ordersData.total_items},${ordersData.total_pallets},${
    //   ordersData.total_weight
    // },${ordersData.total_cubic},'${ordersData.shippingOption}')`);

    const [results] = await conn.execute(
      ` INSERT INTO ${config.env}.Orders
      (id,
        externalReference,
        invoiceID,
      createdDate,
      deliveryCharge,
      freightCost,
      totalAmount,
      voucherId,
      voucherDiscountAmount,
      creditAmount,
      totalTaxes,
      totalDiscount,
      grandTotal,
      grandTotalAfterCredit,
      paymentStatus,
      initiatiedBy,
      customerFName,
      customerLName,
      customerEmail,
      customerPhone,
      customerMobile,
      createdAt,
      updatedAt,
      syncStatus,
      customerID, status, 
      erpNumber,is_quoted,quote_id,delivery_instructions,total_items,total_pallets,total_weight,total_cbm,shippingOption) values('${ordersUUID}','${externalReference}','${
        ordersData.invoiceId
      }',now(),'${ordersData.shippingAmount}','${ordersData.shippingAmount}','${
        ordersData.subAmount
      }',${appliedVoucherObj ? appliedVoucherObj.voucherId : null},${
        appliedVoucherObj
          ? appliedVoucherObj.amountType == 0
            ? appliedVoucherObj.flatAmount
            : appliedVoucherObj.amountTobeDeductedIfPercentage
          : null
      },${
        ordersData.creditAmount ? ordersData.creditAmount : null
      },null,null,'${ordersData.totalAmount}',${
        ordersData.totalAmountAfterCredit
          ? ordersData.totalAmountAfterCredit
          : null
      },'paid','WEB','${customer.firstName}','${customer.lastName}',
      '${customer.email}','${customer.phoneNumber}','${customer.phoneNumber}',
          now(),now(),'cyrus=success','${custUUID}','Pending','',${
        ordersData.isQuoted ? 1 : 0
      }, ${ordersData.isQuoted ? ordersData.quoteId : null}, ${
        ordersData.deliveryInstructions
      }, ${ordersData.total_items},${ordersData.total_pallets},${
        ordersData.total_weight
      },${ordersData.total_cubic},'${ordersData.shippingOption}')`
    );

    const [orderpayment] = await conn.execute(
      ` INSERT INTO ${config.env}.OrderPayments
      (id,
        orderID,
      orderInvoiceID,
      method,
      status,
      amount,
      paymentToken,
      processedAt,
      createdAt,
      updatedAt,
      createdDate
     ) values('${orderPaymentsUUID}','${ordersUUID}','${
        ordersData.invoiceId
      }','${payment.method}','${payment.status}','${payment.amount / 100}',
     '${payment.id}','WEB',now(),now(),now())`
    );

    // update creditBalance credit_members_forms
    console.log(
      "update ${config.env}.credit_members_forms set creditBalance =  ifnull(creditBalance,0) - ${ordersData.creditAmount} where user_id = ${custId}"
    );
    const [credit_members_forms] = await conn.execute(
      `update ${
        config.env
      }.credit_members_forms set creditBalance =  ifnull(creditBalance,0) - ${
        ordersData.creditAmount ? ordersData.creditAmount : 0
      } where user_id = ${custId}`
    );

    let sub_total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      let lineItemsUUID = UUIDV4();
      let lineItemTotalPrice = cartItems[i].price * cartItems[i].qty;
      await conn.execute(
        `INSERT INTO ${config.env}.LineItems
      (id,
      orderID,
      productSimpleID,
      quantity,
      cableLength,
      itemOriginalPrice,
      discountAmount,
      discountPercentage,
      itemPrice,
      lineItemTotalPrice,
      promotionCode,
      deliveryMethod,
      deliveryDate,
      deliveryAddressStreet,
      deliveryAddressSuburb,
      deliveryAddressState,
      deliveryAddressPostcode,
      deliveryAddressCountry,
      productID,
      productName,
      productImage,
      createdAt,
      updatedAt,
      createdDate,
      billingAddressStreet,
      billingAddressSuburb,
      billingAddressState,
      billingAddressPostcode,
      billingAddressCountry) values('${lineItemsUUID}', '${ordersUUID}','${
          cartItems[i].id
        }','${cartItems[i].qty}',${
          cartItems[i].productType !== 1 ? cartItems[i].cableLength : null
        },'${cartItems[i].price}',null,null,
    '${cartItems[i].price}','${lineItemTotalPrice}',null,null,now(),
    '${customer.streetAddress}','${customer.city}','${customer.state}','${
          customer.postCode
        }','${customer.country}',
    '${cartItems[i].id}','${cartItems[i].name}','${
          cartItems[i].image
        }',now(),now(),now(),'${customer.billingStreetAddress}','${
          customer.billingCity
        }','${customer.billingState}','${customer.billingPostCode}','${
          customer.billingCountry
        }')`
      );
      sub_total +=
        parseFloat(cartItems[i].price) * parseFloat(cartItems[i].qty);
      cartItems.full_image =
        `${process.env.PRODUCT_CDN_URL}` + `${cartItems[i].image}`;
    }

    resultData.status = results.affectedRows;
    resultData.orderId = externalReference;
    resultData.invoiceId = ordersData.invoiceId;
    resultData.emailid = customer.email;
    var emailJson = {
      email: customer.email,
      orderitems: cartItems,
      customer_name: customer.firstName + " " + customer.lastName,
      order_date: moment().tz("Australia/Sydney").format("DD/MM/YYYY"),
      order_id: externalReference,
      customer_mobile: customer.phoneNumber,
      sub_total: ordersData.subAmount,
      shipping_total: ordersData.shippingAmount,
      total: ordersData.totalAmount.toFixed(2),
      customer_address: customer.streetAddress,
    };

    sendMailOrderConfirm(emailJson);
    // let cyruspayload = OrderCyrusSync(emailJson);
    // console.log(
    //   "22222222222222222222222222222222" + JSON.stringify(cyruspayload)
    // );
    conn.end();
    return resultData;
  } catch (e) {
    console.log("In Order Error===>>>>>>>>", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const saveCreditPayment = async (req) => {
  console.log("req.body in saveCreditPayment ==========>", req);
  try {
    const resultData = {
      // orderId: "",
      // invoiceId: "",
      amountPaid: "",
      status: 0,
      emailid: "",
    };

    let conn = "";
    let sqlconn = "";
    let customer = req.data.customerData;
    let payment = req.data.paymentInfo;
    // let ordersData = req.data.ordersData;
    // let cartItems = req.data.ordersData.cartItems;
    // let coupon = req.discount_code;
    let externalReference = 0;

    // let ismembership = req.buy_membership ? true : false;

    const mainTotalPrice = {
      ShippingInformation: req.ShippingInformation,
      buy_membership: req.buy_membership,
      cart: req.cartData,
      discount_code: req.discount_code,
      userData: req.userData,
    };

    let totalOrder = 10000;
    let totalTax = 1000;

    let custUUID = UUIDV4();
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    /* externalReference generation using date and UUID
    // prints date & time in YYYY-MM-DD format
    let fullDate = year + "-" + month + "-" + date;
    let externalReferenceUUID = UUIDV4();
    externalReference = fullDate + "-" + externalReferenceUUID;
    console.log("externalReference = ", externalReference);
    */

    const todayDate = moment().format("YYMMDD");

    /*
    // start - externalReference generation using date and random 4 digit number
    let randomNumber = Math.floor(3246 + Math.random() * 2123);
    let fullDate = date.toString() + month.toString() + year.toString();
    externalReference = fullDate + randomNumber.toString();
    //end
    */
    externalReference = `${todayDate}${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [isExists] = await conn.execute(
      `SELECT count(1) tot FROM  ${config.env}.user where email ='${customer.email}' `
    );

    // check for if customer Exists, if yes, assign cust uuid
    if (isExists[0].tot !== 0) {
      console.log("CUSTOMER EXISTS!", custUUID);
      const [custData] = await conn.execute(
        `SELECT id,uuid FROM  ${config.env}.user where  email ='${customer.email}' `
      );
      custUUID = custData[0].uuid;
      var custId = custData[0].id;
    } else {
      custUUID = "unregistered_user";
    }

    // console.log("custUUID DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", custUUID);
    console.log("cust id ", custId);

    const [credit_members_payment] = await conn.execute(
      ` INSERT INTO ${config.env}.credit_members_payment
      (cust_UUID,
      cust_id,
      method,
      status,
      amount,
      paymentToken,
      processedAt,
      createdDate
     ) values('${custUUID}','${custId}','${payment.method}','${
        payment.status
      }','${payment.amount / 100}',
     '${payment.id}','WEB',now())`
    );

    // update creditBalance in credit_members_forms
    console.log(
      `update ${
        config.env
      }.credit_members_forms set creditBalance =  ifnull(creditBalance,0) + ${
        payment.amount / 100
      } where user_id = ${custId}`
    );
    const [credit_members_forms] = await conn.execute(
      `update ${
        config.env
      }.credit_members_forms set creditBalance =  ifnull(creditBalance,0) + ${
        payment.amount / 100
      } where user_id = ${custId}`
    );

    resultData.amountPaid = payment.amount / 100;
    resultData.status = credit_members_payment.affectedRows;
    resultData.emailid = customer.email;

    // const emailJson = {
    //   email: customer.email,
    //   orderitems: cartItems,
    //   customer_name: customer.firstName + " " + customer.lastName,
    //   order_date: moment().tz("Australia/Sydney").format("DD/MM/YYYY"),
    //   order_id: externalReference,
    //   customer_mobile: customer.phoneNumber,
    //   sub_total: ordersData.subAmount,
    //   shipping_total: ordersData.shippingAmount,
    //   total: ordersData.totalAmount,
    //   customer_address:
    //     customer.streetAddress +
    //     " " +
    //     customer.city +
    //     " " +
    //     customer.state +
    //     " " +
    //     customer.country +
    //     " " +
    //     customer.postCode,
    // };
    // sendMailOrderConfirm(emailJson);
    // let cyruspayload = OrderCyrusSync(emailJson);
    // console.log(
    //   "22222222222222222222222222222222" + JSON.stringify(cyruspayload)
    // );
    conn.end();
    return resultData;
  } catch (e) {
    console.log("In Order Error===>>>>>>>>", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${e}`);
  }
};

const validateEmail = async (data) => {
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    console.log(" data from res is :", data);
    let serviceResponse = 0;

    const userExists = await conn.execute(
      `select email  from  ${config.env}.user  WHERE  email = '${data.email}'`
    );
    console.log("user Exists :", userExists[0].length);

    if (userExists[0].length > 0) {
      serviceResponse = 1;
    }

    await conn.close();
    return serviceResponse;
  } catch (error) {
    await conn.close();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const resetPassword = async (email) => {
  let conn = "";
  try {
    console.log("EMAIL AT SERVICE TO RESSET :", email);
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [resetResult] = await conn.execute(
      `select email,first_name,last_name from  ${config.env}.user  WHERE  email = '${email}'`
    );
    await conn.close();
    return resetResult;
  } catch (error) {
    console.log("In Reset Password error:", error);

    await conn.close();
    throw new ApiError(httpStatus.NOT_FOUND, "Password reset failed");
  }
};

async function createPdfFromBlob(blobData, outputFilePath) {
  try {
    // // Read the Blob data into a buffer
    // const blobBuffer = Buffer.from(blobData);
    // // Create a new PDF document
    // const pdfDoc = await PDFDocument.create();
    // // Add a new page to the PDF
    // const page = pdfDoc.addPage([600, 400]); // You can adjust the page size as needed
    // // Embed the Blob data as an image on the page
    // const image = await pdfDoc.embedPng(blobBuffer);
    // const { width, height } = image.scale(0.5); // Adjust the scale as needed
    // page.drawImage(image, {
    //   x: 50,
    //   y: 300,
    //   width,
    //   height,
    // });
    // // Set the title of the PDF (optional)
    // pdfDoc.setTitle("PDF Created from Blob");
    // // Set additional metadata (optional)
    // pdfDoc.setProducer("pdf-lib");
    // pdfDoc.setCreator("Your Name");
    // // Serialize the PDF to a buffer
    // const pdfBytes = await pdfDoc.save();
    // // Write the PDF buffer to a file
    // // fs.writeFileSync(outputFilePath, pdfBytes);
    // fs.writeFileSync(outputFilePath, blobBuffer);
    // (() => {
    //   (blobData) =>
    blobData
      .buffer()
      .then((data) => {
        // fs.createWriteStream("../../utils/files/myFile" + ".pdf").write(data);
        // fs.writeFileSync("myFile.pdf", data);
        console.log("ddddddddddddataaaaaa", data);
        fs.writeFileSync(outputFilePath, data);
      })
      .catch((e) => {
        console.log(e);
      });
    console.log(`PDF saved to ${outputFilePath}`);
  } catch (error) {
    console.error("Error creating PDF:", error);
  }
}

//updated
const uploadCreditMemberForm = async (req) => {
  // console.log("uploadCreditMemberForm SERVICE", req);
  let conn = "";
  try {
    // let buffer = Buffer.from(arraybuffer);
    // let arraybuffer = Uint8Array.from(buffer).buffer;
    let file = req.files.new_file;
    console.log("fileeeeeeeeeee", file);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [resultsformail] = await conn.execute(
      `SELECT email,first_name,last_name  FROM ${config.env}.user where id='${req.body.user_id}'`
    );
    // var localFile = new File([file], "LOCAL FILE NAME");
    // let enctryptedFile = await encryptFileFunction(file);
    // console.log("enctryptedFileeeeeeeee", enctryptedFile);
    // file = enctryptedFile;
    //   fetch(url, options)
    // .then(res => res.buffer())
    // .then(data => {
    //   fs.createWriteStream(objectId + '.pdf').write(data);
    // })
    // .catch(e => {
    //   console.log(e);
    // });
    // (file) =>
    //   file
    //     .buffer()
    //     .then((data) => {
    //       // fs.createWriteStream("../../utils/files/myFile" + ".pdf").write(data);
    //       // fs.writeFileSync("myFile.pdf", data);
    //       console.log("ddddddddddddataaaaaa", data);
    //       fs.writeFileSync("../../utils/files/myFile" + ".pdf", data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    const inputBlobData = file.data;
    // console.log("ppppppp", path);
    // Specify the folder path where you want to save the file
    const folderPath = "src/utils/files";

    // Specify the filename
    const filename = `${resultsformail[0].email}.pdf`;
    // Combine the folder path and filename to create the full file path
    const outputFilePath = path.join(folderPath, filename);
    await convertBlobToFile(inputBlobData, outputFilePath);
    await encryptPdf(resultsformail[0]);
    file = await convertFileToBlob(
      path.join(`src/utils/encryptedFiles/${resultsformail[0].email}.pdf`)
    );
    // node js doesnt have blob, equivalent is buffer
    // since buffer doesnt have blob properties, so assigining similar properties
    file.mimetype = "application/pdf";
    file.data = file.buffer;
    console.log("fileeeeeeeeeee22222222222222", file);
    // return;
    const containerName = `creditfiles`;
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

    // START => REMOVE FILES FROM NODE AFTER UPLOAD

    // remove file from files
    await deleteFile(outputFilePath);
    // remove file from encrypted files
    await deleteFile(
      path.join(`src/utils/encryptedFiles/${resultsformail[0].email}.pdf`)
    );

    // END=> REMOVE FILES FROM NODE AFTER UPLOAD

    if (uploadBlobResponse && req.body.method == 2) {
      // method 2 is e-form

      const result = await conn.execute(
        `INSERT into ${config.env}.credit_members_forms
      (eForm_pdf_url,user_id,method,creditFormJson) 
        values('/${blobName}','${req.body.user_id}','${req.body.method}','${req.body.creditFormJson}')`
      );
      // const [resultsformail] = await conn.execute(
      //   `SELECT email,first_name,last_name  FROM ${config.env}.user where id='${req.body.user_id}'`
      // );
      creditAccountMail({
        email: resultsformail[0].email,
        userName: `${resultsformail[0].first_name} ${resultsformail[0].last_name}`,
        comment: "",
        status: 0,
        subject: "Credit Membership Application is Pending Review",
      });
      //console.log("################>>>>>>>>>>>>>>>>>>>>>>>>>>", resultsformail);
      await conn.close();
      return result;
    } else if (uploadBlobResponse && req.body.method == 1) {
      // method 1 is manual-form
      conn = await mysql.createConnection(config.mysqlDBConfig);
      const result = await conn.execute(
        `INSERT into ${config.env}.credit_members_forms
      (file_url,user_id,method) 
        values('/${blobName}','${req.body.user_id}','${req.body.method}')`
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
      //console.log("################>>>>>>>>>>>>>>>>>>>>>>>>>>", resultsformail);
      await conn.close();
      return result;
    } else {
      return;
    }
  } catch (error) {
    console.log("In uploadCreditMemberForm error:", error);
    throw new ApiError(httpStatus.NOT_FOUND, "File Upload Failed!");
  }
};

const getCreditFormsList = async (req) => {
  console.log("getCreditFormsList SERVICE", req.email);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // const [results] = await conn.execute(
    //   `SELECT ROW_Number() over (order by id desc) sno,id,file_url, status, created_at, (SELECT count(1) FROM ${config.env}.credit_members_forms) as total, (case status when 0 then 'Pending' when 1 then 'In Process' when '2' then 'Approved'  when '3' then 'Reject' end) AS status_name FROM ${config.env}.credit_members_forms order by created_at DESC`
    // );
    const [results] = await conn.execute(
      `SELECT cmf.id,cmf.method,cmf.eForm_pdf_url,cmf.file_url, cmf.status, cmf.comment, cmf.created_at FROM ${config.env}.credit_members_forms as cmf left join ${config.env}.user as us on us.id = cmf.user_id where us.email='${req.email}' order by cmf.id DESC`
    );
    conn.end();
    return results;
  } catch (e) {
    conn.end();
    console.log("In getCreditFormsList Error::::", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getBrandsList = async () => {
  // console.log('In category');
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.brands_master as bm WHERE status=1 order by bm.priority asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getBrandsList error::::6", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getBrandsList:${error}`
    );
  }
};

const getCataloguesList = async () => {
  // console.log('In category');
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.catalogues_master as cm WHERE status=1 order by cm.priority asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCataloguesList error::::6", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCataloguesList:${error}`
    );
  }
};

const getCatalogueDataBySlug = async (req) => {
  console.log(" getCatalogueDataBySlug :::::::::::::::::::::::::", req);
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM  ${
        config.env
      }.catalogues_master WHERE name like '%${req.slug.replace(/-/g, " ")}%'`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCatalogueDataBySlug error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCatalogueDataBySlug:${error}`
    );
  }
};

const getPreassemblesCategory = async () => {
  // console.log('In category');
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.stock_preassembles_category as spc WHERE status=1 order by spc.priority asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getPreassemblesCategory error::::6", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getPreassemblesCategory:${error}`
    );
  }
};

const getCustPreassemblesData = async (req) => {
  console.log("In getCustPreassemblesData SERVICE::::", req);
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.cust_preassembles_terminal_master WHERE status=1 order by created_at asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCustPreassemblesData error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassemblesData:${error}`
    );
  }
};

const getCustPreassemblesCableData = async (req) => {
  console.log("In getCustPreassemblesCableData SERVICE::::", req);
  try {
    let conn = "";
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [results] = await conn.execute(
      `SELECT * FROM ${config.env}.cust_preassembles_cables_master WHERE status=1 order by created_at asc`
    );

    conn.end();
    return results;
  } catch (e) {
    console.log("In getCustPreassemblesCableData error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getCustPreassemblesCableData:${error}`
    );
  }
};

const saveQuotation = async (req) => {
  console.log("saveQuotation SERVICE:::::::::::", req);
  let conn = "";
  // return;
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    // let serviceResponse = { state: true, message: "sucess" };
    let custUUID = "";
    const [cust] = await conn.execute(
      `select * from ${config.env}.user where email = '${req.email}'`
    );
    console.log("ccccccc", cust);
    if (cust.length > 0) {
      custUUID = cust[0].uuid;
    } else {
      custUUID = "unregistered_user";
    }
    const [isExists] = await conn.execute(
      `select count(1) tot from ${config.env}.quotation_master WHERE quoteId = '${req.quoteId}'`
    );
    let cartItems = req.cartItems;
    if (isExists[0].tot == 0) {
      // console.log(`insert into ${config.env}.quotation_master (quoteId,invoiceID,customerID,createdDate)
      // values (
      //   '${req.quoteId}',
      //   '${req.invoiceId}',
      //   '${custUUID}',
      //   now()`);
      const [results] = await conn.execute(
        `insert into ${config.env}.quotation_master (quoteId,invoiceID,customerID,subAmount,shippingAmount,totalAmount,createdDate)
      values (
        '${req.quoteId}',
        '${req.invoiceId}',       
        '${custUUID}',
        '${req.subAmount}',
        '${req.shippingAmount}',
        '${req.totalAmount}',
        now())`
      );

      for (let i = 0; i < cartItems.length; i++) {
        let lineItemTotalPrice = cartItems[i].price * cartItems[i].qty;
        await conn.execute(
          `INSERT INTO ${config.env}.quotation_lineitems
      (quoteId,
      productSimpleID,
      quantity,
      itemOriginalPrice,
      discountAmount,
      discountPercentage,
      itemPrice,
      lineItemTotalPrice,
      promotionCode,
      productID,
      productName,
      productImage) values('${req.quoteId}','${cartItems[i].id}','${cartItems[i].qty}','${cartItems[i].price}',null,null,
    '${cartItems[i].price}','${lineItemTotalPrice}',null,
    '${cartItems[i].id}','${cartItems[i].name}','${cartItems[i].image}')`
        );
      }
      conn.end();
      return results;
    } else {
      await conn.execute(
        `DELETE FROM ${config.env}.quotation_lineitems WHERE quoteId = '${req.quoteId}'`
      );
      for (let i = 0; i < cartItems.length; i++) {
        let lineItemTotalPrice = cartItems[i].price * cartItems[i].qty;
        await conn.execute(
          `INSERT INTO ${config.env}.quotation_lineitems
      (quoteId,
      productSimpleID,
      quantity,
      itemOriginalPrice,
      discountAmount,
      discountPercentage,
      itemPrice,
      lineItemTotalPrice,
      promotionCode,
      productID,
      productName,
      productImage) values('${req.quoteId}','${cartItems[i].id}','${cartItems[i].qty}','${cartItems[i].price}',null,null,
    '${cartItems[i].price}','${lineItemTotalPrice}',null,
    '${cartItems[i].id}','${cartItems[i].name}','${cartItems[i].image}')`
        );
      }
      // for (let i = 0; i < cartItems.length; i++) {
      //   let lineItemTotalPrice = cartItems[i].price * cartItems[i].qty;
      //   console.log(`UPDATE ${config.env}.quotation_lineitems SET
      //   productSimpleID = '${cartItems[i].id}',
      //   quantity = '${cartItems[i].qty}',
      //   itemOriginalPrice = '${cartItems[i].price}',
      //   itemPrice = '${cartItems[i].price}',
      //   lineItemTotalPrice = '${lineItemTotalPrice}',
      //   productID = '${cartItems[i].id}',
      //   productName = '${cartItems[i].name}',
      //   productImage = '${cartItems[i].image}' WHERE quoteId = '${req.quoteId}'`);

      //   await conn.execute(
      //     `UPDATE ${config.env}.quotation_lineitems SET
      // productSimpleID = '${cartItems[i].id}',
      // quantity = '${cartItems[i].qty}',
      // itemOriginalPrice = '${cartItems[i].price}',
      // itemPrice = '${cartItems[i].price}',
      // lineItemTotalPrice = '${lineItemTotalPrice}',
      // productID = '${cartItems[i].id}',
      // productName = '${cartItems[i].name}',
      // productImage = '${cartItems[i].image}' WHERE quoteId = '${req.quoteId}'`
      //   );
      // }
      conn.end();
      return (results = []);
    }
  } catch (e) {
    conn.end();
    console.log(" saveQuotation Error >>>>>>>>>>>>>>>", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const saveCustomProductQuote = async (req) => {
  console.log("saveCustomProductQuote SERVICE:::::::::::", req);
  //   {
  //     "T1": {
  //         "main_filter": null,
  //         "filter_1": null,
  //         "filter_2": null,
  //         "filter_3": null,
  //         "filter_4": null,
  //         "filter_5": null,
  //         "filter_6": null,
  //         "filter_7": null,
  //         "img_url": null,
  //         "sparkyId": null,
  //         "partNo": "t1111"
  //     },
  //     "T2": {
  //         "main_filter": null,
  //         "filter_1": null,
  //         "filter_2": null,
  //         "filter_3": null,
  //         "filter_4": null,
  //         "filter_5": null,
  //         "filter_6": null,
  //         "filter_7": null,
  //         "img_url": null,
  //         "sparkyId": null,
  //         "partNo": "t2222"
  //     },
  //     "cable": {
  //         "filter_1": null,
  //         "filter_2": null,
  //         "filter_3": null,
  //         "filter_4": null,
  //         "filter_5": null,
  //         "filter_6": null,
  //         "filter_7": null,
  //         "jacket_colour": null,
  //         "sparkyId": null,
  //         "partNo": "cccc"
  //     },
  //     "email": "ishaan@jabitsoft.com",
  //     "quote_date": "06/03/2024",
  //     "customer_name": "Ishaan Gupta",
  //     "cust_quote_id": "2206032024undefined"
  // }
  let conn = "";
  // return;
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    console.log(`INSERT INTO ${config.env}.custom_quotation_master
    (
    quoteId,
    customerID,
    T1,
    T2,
    cable,
    createdDate)
    VALUES
    (
    '${req.cust_quote_id}',
     ${req.customer_id},
    '${JSON.stringify(req.T1)}',
    '${JSON.stringify(req.T2)}',
    '${JSON.stringify(req.cable)}',
    '${req.quote_date}'
  );`);
    const [cust] = await conn.execute(
      `INSERT INTO ${config.env}.custom_quotation_master
      (
      quoteId,
      customerID,
      T1,
      T2,
      cable,
      createdDate)
      VALUES
      (
      '${req.cust_quote_id}',
       ${req.customer_id},
      '${JSON.stringify(req.T1)}',
      '${JSON.stringify(req.T2)}',
      '${JSON.stringify(req.cable)}',
      '${req.quote_date}'
    );`
    );
    const [updateCust] = await conn.execute(`UPDATE user AS u
    INNER JOIN user AS uu ON u.id = uu.id
    SET u.cust_product_count = uu.cust_product_count+1 where u.id = ${req.customer_id}
    `);
    console.log("saveCustomProductQuote RESPONSE", {
      cust,
      updateCust,
    });
    conn.end();
    await sendNotRegularProductEmail(req);
    await sendNotRegularProductEmailToSparky(req);
    return {
      cust,
      updateCust,
    };
  } catch (e) {
    conn.end();
    console.log(" saveCustomProductQuote SERVICE Error >>>>>>>>>>>>>>>", e);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

const getShippingCharges = async (req, res) => {
  let callApiUrl = `https://tlm.saviy.com.au/als_dma_prog/v20220912/saviy_quoting_api.php`;
  console.log("getShippingCharges SERVICES req.body = ", req.body);
  await axios
    .post(`${callApiUrl}`, req.body, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        // security_key: "25f9d78262841dd9726",
      },
    })
    .then(function (response) {
      console.log("%%%%%%%%%%%%%%%%%%%%", response.data);
      res
        .status(200)
        .send({ msg: "getShippingCharges ok", data: response.data });
      // return response;
    })
    .catch(function (error) {
      console.log("getShippingCharges AXIOS error", error);
      res.status(500).send(null);
    })
    .then(function () {});
};

const eFormObject = async (req) => {
  console.log("eFormObject SERVICE", req);
  // return;
  try {
    // let buffer = Buffer.from(arraybuffer);
    // let arraybuffer = Uint8Array.from(buffer).buffer;
    let file = req.files.new_file;
    // return;
    const containerName = `creditfiles`;
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
    // const blobName = fileID + "." + file;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const options = { blobHTTPHeaders: { blobContentType: file.mimetype } };
    // const options = {
    //   blobHTTPHeaders: { blobContentType: "application/json" },
    // };
    const uploadBlobResponse = await blockBlobClient.uploadData(file, options);
    console.log(
      `Upload block blob ${blobName} successfully`,
      uploadBlobResponse
    );
    // return uploadBlobResponse;
    if (uploadBlobResponse) {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      const result = await conn.execute(
        `INSERT into ${config.env}.credit_members_forms
      (file_url,user_id) 
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
      //console.log("################>>>>>>>>>>>>>>>>>>>>>>>>>>", resultsformail);
      await conn.close();
      return result;
    } else {
      return;
    }
  } catch (error) {
    console.log("In uploadCreditMemberForm error:", error);
    throw new ApiError(httpStatus.NOT_FOUND, "File Upload Failed!");
  }
};

const handleWishlist = async (req, type) => {
  const {
    product_price,
    product_id,
    product_name,
    product_category,
    product_type,
    product_image,
    user_id,
    user_email,
    product_cable_length,
  } = req;

  let conn = "";

  // return;
  try {
    console.log("handleWishlist >>>>>>>>>>>", req, type);
    conn = await mysql.createConnection(config.mysqlDBConfig);
    if (type === "add") {
      conn = await mysql.createConnection(config.mysqlDBConfig);
      const [isExists] = await conn.execute(
        `SELECT COUNT(1) as is_exists FROM ${config.env}.wishlist where user_id = ${user_id} AND product_id= '${product_id}'`
      );
      console.log("isExists", isExists);
      if (isExists[0].is_exists > 0) {
        return {
          success: false,
          message: `Product ID ${product_id} already exists in user id ${user_id} wishlist!, NOT WISHLISTED!`,
        };
      } else if (product_type === 3) {
        //handle custom product
        const [result] = await conn.execute(`INSERT INTO ${config.env}.wishlist 
          (user_id,user_email,product_id,product_name,product_price,product_type,product_image_T1,product_image_T2,product_image_cable,product_cable_length) 
          values (${user_id},'${user_email}','${product_id}','${product_name}',${product_price},${product_type},'${product_image.pathT1}','${product_image.pathT2}','${product_image.colorCable}',${product_cable_length})
          `);
        await conn.close();
        return {
          success: true,
          message: "added to wishlist successfully",
        };
      } else if (product_type === 1 || product_type === 2) {
        const [result] = await conn.execute(`INSERT INTO ${config.env}.wishlist 
      (user_id,user_email,product_id,product_name,product_price,product_type,product_image,product_cable_length) 
      values (${user_id},'${user_email}','${product_id}','${product_name}',${product_price},${product_type},'${product_image}',${product_cable_length})
      `);
        await conn.close();
        console.log("!!add wishlist else", result);
        return {
          success: true,
          message: "added to wishlist successfully",
        };
      }
    } else if (type === "delete") {
      console.log("delete wishlist", product_id, user_id);
      const [result] = await conn.execute(`DELETE FROM ${config.env}.wishlist 
          where product_id='${product_id}' and user_id=${user_id}`);
      // console.log("!!delete wishlst result", result);
      await conn.close();
      return {
        message: "deleted from wishlist",
        success: true,
      };
    }
  } catch (error) {
    console.log("In wishlist handle error:", error);
    throw new ApiError(httpStatus.NOT_FOUND, "wishlist request is Failed!");
  }
};

const getMyWishlist = async (req) => {
  const { productId } = req.query;
  console.log("req query", req.query);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    if (productId) {
      const [result] = await conn.execute(
        `select * from ${config.env}.wishlist 
       where user_id=${req.params.id} and product_id=${productId}`
      );
      return result;         
    } else {
      let query = `select w.id as wishlist_id,w.uuid,w.created_at,w.product_cable_length,pp.id,'' star_rating, name,pp.product_type,product_dimensions,product_key_features, slug, description, pallets,weight,cbm ,price, meta_description, cable_pricing_permeter, meta_keyword, pp.sparky_id, pp.manufacturer_id,sm.stock,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pp.id) product_media,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pp.id and (pm.lifestyle=1  or pm.default_image=1)) product_media_list,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pp.id) category_hierarchy,
       ( SELECT JSON_ARRAYAGG(JSON_OBJECT('id', convert(uuid, CHAR), 'product_id', convert(pp.uuid, CHAR), 'star_rating', star_rating,'display_name', convert(display_name, CHAR), 'email_address', convert(email_address, CHAR),   'title', convert(title, CHAR), 'feedback', convert(feedback, CHAR), 'image', convert(image, CHAR), 'feedback_status', feedback_status, 'image_status', image_status)) from customer_review as cr  where cr.product_id = pp.id and cr.approved=1 and archive=0)  product_reviews,
       ( SELECT JSON_ARRAYAGG(JSON_OBJECT('slug',p.slug,'name',p.name,'id',p.id, 'product_media_list', ((SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pbt.sub_product_id and (pm.lifestyle=1  or pm.default_image=1))),'priceJson',(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pbt.sub_product_id),'categoryHeirarchy',(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pbt.sub_product_id))) FROM product_bought_together as pbt left outer join product as p  
      on pbt.sub_product_id=p.id
       where pbt.product_id=pp.id) as bought_together
       ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('CertificateName',certificate_name,'CertificateImage',certificate_image,'UploadStatus',upload_status)) from product_certificate as pc where pc.product_id = pp.id) product_certificate
      ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('DocumentName',document_name,'DocumentImage',document_image,'UploadStatus',upload_status)) from product_document as pd where pd.product_id = pp.id) product_document
      ,(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pp.id) product_price
      ,( SELECT JSON_ARRAYAGG(JSON_OBJECT('slug',p.slug,'name',p.name,'id',p.id, 'product_media_list', ((SELECT JSON_ARRAYAGG(JSON_OBJECT('path', media_url, 'defaultImage', default_image  , 'lifestyleImage', lifestyle)) from product_media as pm where pm.product_id = pat.sub_product_id and (pm.lifestyle=1  or pm.default_image=1))),'priceJson',(SELECT JSON_ARRAYAGG(JSON_OBJECT('price',product_price,'quantity',product_quantity)) from product_price as ppp where ppp.product_id = pat.sub_product_id),'categoryHeirarchy',(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', uuid ,'name', name, 'slug', name )) from product_category as pc left join category as cc on pc.category_id=cc.id where pc.product_id = pat.sub_product_id))) FROM product_alternative_together as pat left outer join product as p  
      on pat.sub_product_id=p.id
       where pat.product_id=pp.id) as alternate_together
       from wishlist as w
                left join product as pp on pp.id=w.product_id
                inner join stock_master sm on (pp.sparky_id = sm.sparky_id OR pp.id = sm.product_id)
                where w.user_id=${req.params.id} ORDER BY w.created_at DESC`;
      const [result] = await conn.execute(query);
      return result;
    }
  } catch (error) {
    console.log("In getMyWishlist handle error:", error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "fetch wishlist request is Failed!"
    );
  }
};

const getMyOrders = async (req) => {
  const { email } = req.query;
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    const [result] = await conn.execute(
      `select distinct o.externalReference as orderID,o.status,o.createdDate,o.trackingNumber,o.totalTaxes,o.totalAmount as subTotal,o.creditAmount,
      o.deliveryCharge,o.voucherDiscountAmount,o.grandTotal,o.grandTotalAfterCredit,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT(
      'img_url', l.productImage,
      'productName', l.productName,
      'productQty',l.quantity,
      'productPrice',l.itemPrice,
      'discountAmount',l.discountAmount,
      'subTotal',l.lineItemTotalPrice
      )) from lineitems l where l.orderID = o.id) as productLineItems
      from ${config.env}.customers as c 
      join ${config.env}.orders as o 
      on c.id=o.id
      join ${config.env}.lineitems as l
      on c.id=l.orderId
      where c.email='${email}' order by createdDate desc`
    );
    return result;
  } catch (error) {
    console.log("In getMyOrders handle error:", error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "fetch MyOrders request is Failed!"
    );
  }
};

const getProductFilters = async (req) => {
  console.log("In getProductFilters SERVICE::::", req);
  let conn = "";
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);

    const [r] = await conn.execute(
      `select subCatId from subcat_product_filter_master where subCatName = '${
        req.paths.split("?")[0]
      }' limit 1`
    );
    console.log("^^^^^^^^^^", r);
    const subCatId = r[0]?.subCatId;
    console.log("^^^^^^^^^^2222", subCatId);
    if (subCatId) {
      const [results] = await conn.execute(
        `select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber1) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=1 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id  where fm.subCatId = ${subCatId}  and fm.custmFilterNumber=1 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber2) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=2 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id   where fm.subCatId = ${subCatId} and fm.custmFilterNumber=2 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber3) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=3 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id  where fm.subCatId = ${subCatId} and fm.custmFilterNumber=3 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber4) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=4 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id  where fm.subCatId = ${subCatId} and fm.custmFilterNumber=4 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG( p.custmFilterNumber5) from product p join product_category pc on p.id = pc.product_id left join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=5) as filter_values
      from subcat_product_filter_master fm 
       join product_category pc on fm.subCatId = pc.category_id where fm.subCatId = ${subCatId}
       and fm.custmFilterNumber=5 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber6) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=6 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id where fm.subCatId = ${subCatId} and fm.custmFilterNumber=6 
      union
      select subCatId,filterName,custmFilterNumber, (select JSON_ARRAYAGG(p.custmFilterNumber7) from product p join product_category pc on p.id = pc.product_id join subcat_product_filter_master fm on fm.subCatId = pc.category_id where subCatId = ${subCatId} and fm.custmFilterNumber=7 ) as filter_values
      from subcat_product_filter_master fm 
      left join product_category pc on fm.subCatId = pc.category_id where fm.subCatId = ${subCatId} and fm.custmFilterNumber=7`
      );

      conn.end();
      return results;
    } else {
      // return empty array if no filters
      conn.end();
      return [];
    }
  } catch (e) {
    console.log("In getProductFilters error::::", e);

    conn.end();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error getProductFilters:${error}`
    );
  }
};

const chargeRequest = async (req, res) => {
  let callApiUrl = `https://api.preproduction.powerboard.commbank.com.au/v1/charges`;
  console.log("chargeRequest SERVICES req.body = ", req.body);
  await axios
    .post(`${callApiUrl}`, JSON.stringify(req.body), {
      headers: {
        "Content-Type": "application/json",
        // "Content-Type": "application/jsonContent",
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Credentials": true,
        "x-user-secret-key": process.env.COMMONWEALTH_BANK_API_Secret_Key,
      },
    })
    .then(function (response) {
      console.log("chargeRequest response %%%%%%%%%%%%%%%%%%%%", response.data);
      res.status(200).send({ msg: "chargeRequest ok", data: response.data });
      // return response;
    })
    .catch(function (error) {
      console.log("chargeRequest AXIOS error", error);
      console.log("chargeRequest AXIOS error", error.response.data);
      res.status(error.response.status).send(error.response.data);
    });
};

const sendEnquiry = async (req, res) => {
  console.log("sendEnquiry SERVICE req = ", req);
  let conn = "";
  let serviceResponse = { state: true, message: "sucess" };
  try {
    conn = await mysql.createConnection(config.mysqlDBConfig);
    let query = `INSERT INTO ${config.env}.enquiry
    (
    enquiry_no,
    userid,
    name,
    email,
    mobile_no,
    subject,
    message)
    VALUES
    (
    '${req.enquiry_no}',
    '${req.userid}',
    '${req.firstName}',
    '${req.email}',
    '${req.phonenumber}',
    '${req.subject}',
    '${req.message}'
    );`;

    console.log("qqqq", query);
    await conn.execute(query);

    conn.end();
    const emailJson = {
      email: req.email,
      customer_name: req.firstName,
      mobile_no: req.phonenumber,
      subject: req.subject,
      message: req.message,
      enquiry_no: req.enquiry_no,
      userid: req.userid === -1 ? "Guest User" : req.userid,
    };
    await sendEnquiryEmailToSparky(emailJson);
    await sendEnquiryEmailToCustomer(emailJson);

    return serviceResponse;
  } catch (e) {
    console.log("In sendEnquiry  Error::::", e);
    conn.end();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error :${error}`);
  }
};

module.exports = {
  getCategory,
  getProductByCategory,
  getProductDetails,
  getProductByCategoryTotal,
  getMainBanner,
  getOtherBanner,
  getContentData,
  getSubCategory,
  registerSaveData,
  loginUserWithEmailAndPassword,
  getUserDetailsFromDB,
  getCategoryBySlug,
  updateProfile,
  resetPasswordSubmit,
  logout,
  checkloginStatus,
  productSearch,
  getProdTotal,
  getPopularProducts,
  saveFinalOrder,
  validateEmail,
  resetPassword,
  uploadCreditMemberForm,
  getCreditFormsList,
  getIndustriesList,
  getBrandsList,
  getCataloguesList,
  getCatalogueDataBySlug,
  getPreassemblesCategory,
  getCustPreassemblesData,
  getCustPreassemblesCableData,
  saveQuotation,
  getShippingCharges,
  saveCreditPayment,
  eFormObject,
  getAssemblySolutionsList,
  getCategoryList,
  getProductFilters,
  handleWishlist,
  getMyOrders,
  getMyWishlist,
  chargeRequest,
  sendEnquiry,
  saveCustomProductQuote,
};
