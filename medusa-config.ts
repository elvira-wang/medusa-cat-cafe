import {loadEnv, defineConfig} from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
            storeCors: process.env.STORE_CORS!,
            adminCors: process.env.ADMIN_CORS!,
            authCors: process.env.AUTH_CORS!,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    modules: [
        {
            resolve: "@medusajs/medusa/fulfillment",
            options: {
                providers: [
                    {
                        resolve: "@medusajs/medusa/fulfillment-manual",
                        id: "manual" // fulfillment_provider 表中的 id = [service中的identifier]_[此处注册的id]。所以系统 default fulfillment provider的 id 为：manual_manual
                    },
                    // {
                    //     resolve: "./src/modules/4px-fulfillment",
                    //     id: "fourpx",
                    //     options: {
                    //         appKey: process.env.FOURPX_APP_KEY,
                    //         appSecret: process.env.FOURPX_APP_SECRET,
                    //         baseURL: process.env.FOURPX_API_URL,
                    //     }
                    // }
                ]
            }
        }
    ]
})
