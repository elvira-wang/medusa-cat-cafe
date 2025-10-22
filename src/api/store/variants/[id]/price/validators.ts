import { z } from "zod";

export const PostCustomPriceSchema = z.object({
	region_id: z.string(),
	metadata: z.object({
		height: z.number(),
		width: z.number(),
	}),
});
