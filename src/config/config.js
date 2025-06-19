require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});

module.exports = {
  port: process.env.PORT,
  baseUrl: process.env.BASE_URL,
  env: process.env.WEB_DB_NAME,
  node_env: process.env.NODE_ENV,
  sendgridKey:
    process.env.NODE_ENV == "prod"
      ? process.env.SENDGRID_API_KEY_PROD
      : process.env.SENDGRID_API_KEY,
  jwt: {
    secret: process.env.TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN,
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutesMoment:
      process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES_MOMENT,
    resetPasswordExpirationMinutes:
      process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    jwtResetKey: process.env.JWT_RESET_KEY,
  },
  mssqlDBConfig: {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    options: {
      instancename: process.env.INSTANCE_NAME,
      trustedconnection: true,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  },
  mysqlDBConfig: {
    host: process.env.WEB_DB_HOST,
    user: process.env.WEB_DB_USERNAME,
    password: process.env.WEB_DB_PASSWORD,
    port: process.env.WEB_DB_PORT,
    database: process.env.WEB_DB_NAME,
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true,
  },
  checkoutUrl: process.env.ZIP_CHECKOUT_URL,
  chargeUrl: process.env.ZIP_CHARGE_URL,
  zipVersion: process.env.ZIP_VERSION,
  zipToken: process.env.ZIP_TOKEN,
  // imageUrl:'http://192.168.0.149:8081' // local
  //imageUrl: "http://3.28.109.65:8081", //
};
