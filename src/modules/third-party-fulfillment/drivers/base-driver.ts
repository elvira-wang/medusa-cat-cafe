import type {
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOrderDTO,
} from "@medusajs/framework/types";

export type CreateOrderData = {
  data: Record<string, unknown>;
  items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[];
  order: Partial<FulfillmentOrderDTO> | undefined;
  fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>;
};

export type ListProductsResponse = {
  logistics_product_id: string;
  logistics_product_code: string;
  logistics_product_name: string;
  carrier_id: string;
}[];

export interface BaseDriver {
  createOrder(data: CreateOrderData): Promise<any>;

  getOrder(data: any): Promise<any>;

  cancelOrder(data: any): Promise<any>;

  holdOrder(data: any): Promise<any>;

  getLabel(data: any): Promise<any>;

  listLabels(data: any): Promise<any>;

  listLogisticsProducts(data: any): Promise<ListProductsResponse>;

  getEstimatedCost(data: any): Promise<any>;

  getTracking(data: any): Promise<any>;
}
