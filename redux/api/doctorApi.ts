import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  IDoctor,
  GetPublicDoctorsParams,
  GetPublicDoctorsResponse,
} from "../types/doctor.types";
import type { ApiResponse } from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/doctor`,
  }),
  tagTypes: ["PublicDoctors"],
  endpoints: (builder) => ({
    // 1. Get Public / Published Doctors (Directory view for Admin Panel)
    getPublicDoctors: builder.query<
      GetPublicDoctorsResponse,
      GetPublicDoctorsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.Search) queryParams.set("Search", params.Search);
        if (params?.Specialization)
          queryParams.set("Specialization", params.Specialization);
        if (params?.SpecializationId)
          queryParams.set("SpecializationId", params.SpecializationId);
        if (params?.IsOnline !== undefined)
          queryParams.set("IsOnline", String(params.IsOnline));
        if (params?.Page) queryParams.set("Page", String(params.Page));
        if (params?.Limit) queryParams.set("Limit", String(params.Limit));

        const qs = queryParams.toString();
        return `/public${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.Data?.Doctors
          ? [
              ...result.Data.Doctors.map((doc) => ({
                type: "PublicDoctors" as const,
                id: doc._id || doc.Id,
              })),
              { type: "PublicDoctors" as const, id: "LIST" },
            ]
          : [{ type: "PublicDoctors" as const, id: "LIST" }],
    }),

    // 2. Get Public Doctor By ID (Doctor Profile Modal for Admin Panel)
    getPublicDoctorById: builder.query<ApiResponse<IDoctor>, string>({
      query: (id) => `/public/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PublicDoctors", id }],
    }),
  }),
});

export const {
  useGetPublicDoctorsQuery,
  useGetPublicDoctorByIdQuery,
} = doctorApi;
