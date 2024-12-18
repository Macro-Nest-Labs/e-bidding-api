export interface IRule {
  uuid: string;
  name: string;
  description?: string;
}

export interface IRuleCreateRequestBody {
  uuid: string;
  name: string;
  description?: string;
}

export interface IRuleUpdateRequestBody {
  name?: string;
  description?: string;
}

export interface IRuleRequestParams {
  id?: string;
  uuid?: string;
}
