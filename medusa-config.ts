import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "./src/modules/logistics",
      options: {
        fpxAppKey: process.env.FOURPX_APP_KEY,
        fpxAppSecret: process.env.FOURPX_APP_SECRET,
        fpxBaseURL: process.env.FOURPX_BASE_URL,
        yuntuAppId: process.env.YUNTU_APP_ID,
        yuntuAppSecret: process.env.YUNTU_APP_SECRET,
        yuntuSourceKey: process.env.YUNTU_SOURCE_KEY,
        yuntuBaseURL: process.env.YUNTU_BASE_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual", // fulfillment_provider 表中的 id = [service中的identifier]_[此处注册的id]。所以系统 default third-party-fulfillment provider的 id 为：manual_manual
          },
          // {
          //   resolve: "./src/modules/third-party-fulfillment",
          //   id: "third-party-fulfillment",
          //   options: {
          //     fpxAppKey: process.env.FOURPX_APP_KEY,
          //     fpxAppSecret: process.env.FOURPX_APP_SECRET,
          //     fpxBaseURL: process.env.FOURPX_API_URL, //TODO: change to production URL when go live
          //     yuntuAppId: process.env.YUNTU_APP_ID,
          //     yuntuAppSecret: process.env.YUNTU_APP_SECRET,
          //     yuntuSourceKey: process.env.YUNTU_SOURCE_KEY,
          //     yuntuBaseURL: process.env.YUNTU_BASE_URL, //TODO: change to production URL when go live
          //   },
          // },
          { resolve: "./src/modules/test-fulfillment", id: "test-fulfillment" },
        ],
      },
      dependencies: ["logistics"],
    },
    // {
    //     resolve: "./src/modules/message",
    // }
  ],
});
