import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  GetAppointmentsParams,
  GetAppointmentsResponse,
  GetSingleAppointmentResponse,
} from "../types/appointment.types";
import type { AuthRootState } from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/appointment`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as AuthRootState;
      const token =
        state.auth?.token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("admin_token")
          : null);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Appointments"],
  endpoints: (builder) => ({
    // 1. Get Appointments List with Summary & Pagination
    getAppointments: builder.query<
      GetAppointmentsResponse,
      GetAppointmentsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.Page) queryParams.set("Page", String(params.Page));
        if (params?.Limit) queryParams.set("Limit", String(params.Limit));
        if (params?.Status && params.Status.toLowerCase() !== "all") {
          queryParams.set("Status", params.Status);
        }
        if (params?.Search) queryParams.set("Search", params.Search);
        if (params?.DoctorId) queryParams.set("DoctorId", params.DoctorId);
        if (params?.Date) queryParams.set("Date", params.Date);

        const qs = queryParams.toString();
        return `${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.Data?.Appointments
          ? [
              ...result.Data.Appointments.map((app) => ({
                type: "Appointments" as const,
                id: app._id || app.Id,
              })),
              { type: "Appointments" as const, id: "LIST" },
            ]
          : [{ type: "Appointments" as const, id: "LIST" }],
    }),

    // 2. Get Single Appointment Details
    getAppointmentById: builder.query<GetSingleAppointmentResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Appointments", id }],
    }),
  }),
});

export const { useGetAppointmentsQuery, useGetAppointmentByIdQuery } =
  appointmentApi;
