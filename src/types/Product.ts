export interface IProduct {
  uuid: string;
  name: string;
  description: string;
}

export interface IProductCreateRequestBody {
  name: string;
  description?: string;
}

export interface IProductUpdateRequestBody {
  name?: string;
  description?: string;
}

export interface IProductRequestParams {
  id: string;
}
