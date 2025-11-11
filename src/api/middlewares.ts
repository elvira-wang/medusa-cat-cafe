import {
	defineMiddlewares,
	validateAndTransformBody,
} from "@medusajs/framework/http";
import { PostCustomPriceSchema } from "./store/variants/[id]/price/validators";
import { PostAddCustomLineItemSchema } from "./store/carts/[id]/line-iems-custom/route";
import { PostCreateCustomerSchema } from "./commerce-modules/customer/create-customer/validators";
import { authenticate } from "@medusajs/medusa";

export default defineMiddlewares({
	routes: [
		{
			matcher: "/store/variants/:id/price",
			methods: ["POST"],
			middlewares: [validateAndTransformBody(PostCustomPriceSchema)],
		},
		{
			matcher: "/store/carts/:id/line-items-custom",
			methods: ["POST"],
			middlewares: [
				validateAndTransformBody(PostAddCustomLineItemSchema),
			],
		},
		{
			matcher: "/commerce-modules/customer/create-customer",
			methods: ["POST"],
			middlewares: [
				validateAndTransformBody(PostCreateCustomerSchema),
				authenticate("customer", ["session", "bearer"], {
					allowUnregistered: true,
				}),
			],
		},
	],
});
