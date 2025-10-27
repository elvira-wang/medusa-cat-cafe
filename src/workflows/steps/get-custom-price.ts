import { ProductVariantDTO } from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export type GetCustomPriceStepInput = {
	variant: ProductVariantDTO & {
		calculated_price?: {
			calculated_amount: number;
		};
	};
	metadata?: Record<string, unknown>;
};
const CUSTOM_PRICE_FACTOR = 0.2;
export const getCustomPriceStep = createStep(
	"get-custom-price",
	async ({ variant, metadata = {} }: GetCustomPriceStepInput) => {
		if (!variant.product?.metadata?.is_personalized) {
			return new StepResponse(
				variant.calculated_price?.calculated_amount || 0
			);
		}
		if (!metadata.pattern || !metadata.size) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				"Custom price requires pattern and size metadata to be set."
			);
		}
		const pattern = metadata.pattern as number;
		const size = metadata.size as number;

		const originalPrice = variant.calculated_price?.calculated_amount || 0;
		const customPrice =
			originalPrice + pattern * size * CUSTOM_PRICE_FACTOR;
		return new StepResponse(customPrice);
	}
);
