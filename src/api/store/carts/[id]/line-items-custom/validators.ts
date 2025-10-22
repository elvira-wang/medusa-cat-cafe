import { z } from "zod";

export const PostAddCustomLineItemSchema = z.object({
	variant_id: z.string(),
	quantity: z.number().optional(),
	metadata: z.record(z.unknown()).optional(),
});
