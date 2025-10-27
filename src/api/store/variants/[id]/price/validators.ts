import { z } from "zod";

export const PostCustomPriceSchema = z.object({
	region_id: z.string(),
	metadata: z.object({
		pattern: z.number(),
		size: z.number(),
	}),
});
