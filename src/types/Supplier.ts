import { City, State } from '../utils/state-city-mapping-complete';

export interface ISupplier {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  state?: State;
  city?: City[State];
  vendorCode?: string;
}

export interface ISupplierCreateRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  state?: State;
  city?: City[State];
  vendorCode?: string;
}

export interface ISupplierUpdateRequestBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  state?: State;
  city?: City[State];
  vendorCode?: string;
}

export interface ISupplierRequestParams {
  id: string;
}
