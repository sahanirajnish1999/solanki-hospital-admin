export interface IAppointment {
  _id: string;
  Id?: string;
  PatientId: string;
  DoctorId: string;
  SpecializationId?: string;
  PatientName: string;
  PatientPhone: string;
  PatientEmail: string;
  DoctorName: string;
  DoctorSpecialization: string;
  AppointmentDate: string;
  AppointmentTime: string;
  TokenNumber: number;
  AppointmentNumber: string;
  EmergencyLevel?: string;
  ConsultationFee: number;
  ProblemDescription?: string;
  Status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | string;
  PaymentStatus: "Paid" | "Pending" | "Failed" | string;
  PaymentId?: string;
  CancellationReason?: string;
  Prescription?: string;
  Notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSummary {
  TodayScheduledSlots: number;
  ConsultationCompleted: number;
  TotalAssignedPatients: number;
  ConfirmedPatients: number;
}

export interface AppointmentPagination {
  Total: number;
  Page: number;
  Limit: number;
  Pages: number;
  Next: number | null;
  Previous: number | null;
  HasNextPage: boolean;
  HasPrevPage: boolean;
}

export interface GetAppointmentsParams {
  Page?: number;
  Limit?: number;
  Status?: string;
  Search?: string;
  DoctorId?: string;
  Date?: string;
}

export interface GetAppointmentsResponse {
  Success: boolean;
  Message: string;
  Data: {
    Summary: AppointmentSummary;
    Appointments: IAppointment[];
    Pagination: AppointmentPagination;
  };
}

export interface GetSingleAppointmentResponse {
  Success: boolean;
  Message: string;
  Data: IAppointment;
}
