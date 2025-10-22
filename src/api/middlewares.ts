import {
	defineMiddlewares,
	validateAndTransformBody,
} from "@medusajs/framework";
import { PostCustomPriceSchema } from "./store/variants/[id]/price/validators";

export default defineMiddlewares({
	routes: [
		{
			matcher: "/store/variants/:id/price",
			methods: ["POST"],
			middlewares: [validateAndTransformBody(PostCustomPriceSchema)],
		},
	],
});
