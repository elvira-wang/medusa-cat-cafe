import {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from "@medusajs/framework";
import { PostCreateCustomerSchema } from "./validators";
import { z } from "zod";
import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows";
import { MedusaError } from "@medusajs/framework/utils";

type PostCreateCustomerType = z.infer<typeof PostCreateCustomerSchema>;

export async function POST(
	req: AuthenticatedMedusaRequest<PostCreateCustomerType>,
	res: MedusaResponse
) {
	/* Register token and parameter format validation are handled by middlewares
	 * So we only need to check if the request is already authenticated as a customer */
	if (req.auth_context.actor_id) {
		throw new MedusaError(
			MedusaError.Types.INVALID_DATA,
			"Request already authenticated as a customer."
		);
	}
	const { first_name, last_name, email } = req.validatedBody;

	const { result } = await createCustomerAccountWorkflow(req.scope).run({
		input: {
			authIdentityId: req.auth_context.auth_identity_id!,
			customerData: {
				first_name,
				last_name,
				email,
			},
		},
	});
	res.send({ result });
}
