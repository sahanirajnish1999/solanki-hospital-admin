export type DoctorVerificationStatus = "pending" | "approved" | "rejected";

export interface IDoctor {
  _id?: string;
  Id?: string;
  Name: string;
  Email: string;
  Phone: string;
  Specialization?: string;
  SpecializationId?: string | null;
  Experience?: string;
  About?: string;
  ProfileImage?: string;
  ConsultationFee?: number;
  ConsultationFees?: {
    Normal?: number;
    [key: string]: number | undefined;
  };
  AvailableDays?: string;
  AvailableTime?: string;
  Rating?: number;
  ReviewsCount?: number;
  IsOnline?: boolean;
  IsProfileCompleted?: boolean;
  IsPublished?: boolean;
  IsActive?: boolean;
  IsVerified?: boolean;
  VerificationStatus?: DoctorVerificationStatus;
  RegisteredBy?: "self" | "admin" | string;
  VerifiedAt?: string | Date;
  VerifiedBy?: string;
  RejectionReason?: string;
  LastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateDoctorRequest {
  Name: string;
  Email: string;
  Phone: string;
  Password: string;
  SpecializationId: string;
  ConsultationFee?: number;
  AvailableDays?: string;
  AvailableTime?: string;
}

export interface GetAdminDoctorListParams {
  status?: DoctorVerificationStatus | "all" | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorListSummary {
  Total: number;
  Pending: number;
  Approved: number;
  Rejected: number;
}

export interface GetAdminDoctorListResponse {
  Success: boolean;
  Message: string;
  Data: {
    Summary: DoctorListSummary;
    Pagination: {
      Total: number;
      Page: number;
      Limit: number;
      TotalPages: number;
    };
    Doctors: IDoctor[];
  };
}

export interface VerifyDoctorRequest {
  id: string;
  Status: DoctorVerificationStatus;
  RejectionReason?: string;
}

export interface ManageDoctorRequest {
  id: string;
  ConsultationFee?: number;
  AvailableDays?: string;
  AvailableTime?: string;
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
