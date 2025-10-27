import { z } from "zod";
import { PostCustomPriceSchema } from "./validators";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { getCustomPriceWorkflow } from "../../../../../workflows/get-custom-price";

type PostCustomPriceType = z.infer<typeof PostCustomPriceSchema>;

export async function POST(
	req: MedusaRequest<PostCustomPriceType>,
	res: MedusaResponse
) {
	const { id: variantId } = req.params;
	const { region_id, metadata } = req.validatedBody;

	const { result: price } = await getCustomPriceWorkflow(req.scope).run({
		input: {
			variant_id: variantId,
			region_id,
			metadata,
		},
	});

	res.json({ price });
}
