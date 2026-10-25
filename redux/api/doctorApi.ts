import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  IDoctor,
  CreateDoctorRequest,
  GetAdminDoctorListParams,
  GetAdminDoctorListResponse,
  VerifyDoctorRequest,
  ManageDoctorRequest,
  GetPublicDoctorsParams,
  GetPublicDoctorsResponse,
} from "../types/doctor.types";
import type { ApiResponse, AuthRootState } from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/doctor`,
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
  tagTypes: ["Doctors", "PublicDoctors"],
  endpoints: (builder) => ({
    // 1. Get Admin Doctor Verification List (Protected)
    getDoctorList: builder.query<
      GetAdminDoctorListResponse,
      GetAdminDoctorListParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== "all") {
          queryParams.set("status", params.status);
        }
        if (params?.search) queryParams.set("search", params.search);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));

        const qs = queryParams.toString();
        return `/list${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.Data?.Doctors
          ? [
              ...result.Data.Doctors.map((doc) => ({
                type: "Doctors" as const,
                id: doc._id || doc.Id,
              })),
              { type: "Doctors" as const, id: "LIST" },
            ]
          : [{ type: "Doctors" as const, id: "LIST" }],
    }),

    // 2. Create / Register Doctor (Admin Protected)
    createDoctor: builder.mutation<
      ApiResponse<{ Doctor: IDoctor }>,
      CreateDoctorRequest
    >({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Doctors", id: "LIST" },
        { type: "PublicDoctors", id: "LIST" },
      ],
    }),

    // 3. Verify Doctor Status (Admin Protected: "pending" | "approved" | "rejected")
    verifyDoctor: builder.mutation<
      ApiResponse<{ Doctor: IDoctor }>,
      VerifyDoctorRequest
    >({
      query: ({ id, Status, RejectionReason }) => ({
        url: `/verify/${id}`,
        method: "PATCH",
        body: {
          Status,
          ...(RejectionReason ? { RejectionReason } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Doctors", id },
        { type: "Doctors", id: "LIST" },
        { type: "PublicDoctors", id },
        { type: "PublicDoctors", id: "LIST" },
      ],
    }),

    // 4. Manage Doctor Schedule & Consultation Fee (Admin Protected)
    manageDoctor: builder.mutation<
      ApiResponse<{ Doctor: IDoctor }>,
      ManageDoctorRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/manage/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Doctors", id },
        { type: "Doctors", id: "LIST" },
        { type: "PublicDoctors", id },
        { type: "PublicDoctors", id: "LIST" },
      ],
    }),

    // 5. Get Public / Published Doctors Directory (Public / Overview)
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

    // 6. Get Public Doctor By ID (Doctor Profile Modal)
    getPublicDoctorById: builder.query<ApiResponse<IDoctor>, string>({
      query: (id) => `/public/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PublicDoctors", id }],
    }),
  }),
});

export const {
  useGetDoctorListQuery,
  useCreateDoctorMutation,
  useVerifyDoctorMutation,
  useManageDoctorMutation,
  useGetPublicDoctorsQuery,
  useGetPublicDoctorByIdQuery,
} = doctorApi;
