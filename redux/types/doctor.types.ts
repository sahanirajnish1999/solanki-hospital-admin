export interface IDoctor {
  _id?: string;
  Id?: string;
  Name: string;
  Email: string;
  Phone: string;
  Specialization: string;
  SpecializationId?: string | null;
  Experience?: string;
  About?: string;
  ProfileImage?: string;
  ConsultationFee?: number;
  AvailableDays?: string;
  AvailableTime?: string;
  Rating?: number;
  ReviewsCount?: number;
  IsOnline: boolean;
  IsProfileCompleted: boolean;
  IsPublished: boolean;
  IsActive: boolean;
  LastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


export interface GetPublicDoctorsParams {
  Search?: string;
  Specialization?: string;
  SpecializationId?: string;
  IsOnline?: boolean;
  Page?: number;
  Limit?: number;
}

export interface GetPublicDoctorsResponse {
  Success: boolean;
  Message: string;
  Data: {
    Doctors: IDoctor[];
    Pagination: {
      Total: number;
      Page: number;
      Limit: number;
      Pages: number;
    };
  };
}
