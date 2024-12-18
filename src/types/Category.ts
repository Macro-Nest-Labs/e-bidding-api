export interface ICategory {
  uuid: string;
  name: string;
  description?: string;
}

export interface ICategoryCreateRequestBody {
  name: string;
  description?: string;
}

export interface ICategoryRequestParams {
  id?: string;
  uuid?: string;
}

export interface ICategoryUpdateRequestBody {
  name?: string;
  description?: string;
}