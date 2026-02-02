export type ListProductsResponse = {
  logistics_product_id: string;
  logistics_product_code: string;
  logistics_product_name: string;
}[];

export interface BaseDriver {
  createOrder(data: any): Promise<any>;

  getOrder(data: any): Promise<any>;

  cancelOrder(data: any): Promise<any>;

  holdOrder(data: any): Promise<any>;

  getLabel(data: any): Promise<any>;

  listLabels(data: any): Promise<any>;

  listLogisticsProducts(data: any): Promise<ListProductsResponse>;

  getEstimatedCost(data: any): Promise<any>;

  getTracking(data: any): Promise<any>;
}
