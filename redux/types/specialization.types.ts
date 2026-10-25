export interface ISpecialization {
  _id?: string;
  Id?: string;
  Name: string;
  Description?: string;
  Icon?: string;
  IsActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface GetAllSpecializationsParams {
  Search?: string;
  IsActive?: boolean;
  All?: boolean;
  Page?: number;
  Limit?: number;
}

export interface GetAllSpecializationsResponse {
  Success: boolean;
  Message: string;
  Data: ISpecialization[];
  Total?: number;
  Pagination?: {
    Total: number;
    Page: number;
    Limit: number;
    Pages: number;
  };
}

export interface CreateSpecializationRequest {
  Name: string;
  Description?: string;
  Icon?: string; // base64 or URL
  IsActive?: boolean;
}

export interface UpdateSpecializationRequest {
  id: string;
  Name?: string;
  Description?: string;
  Icon?: string;
  IsActive?: boolean;
}
