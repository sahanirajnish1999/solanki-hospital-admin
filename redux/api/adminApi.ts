import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  AuthRootState,
  IAdmin,
  LoginRequest,
  LoginResponseData,
  SignupRequest,
  SignupResponseData,
  UpdateProfileRequest,
  ChangePasswordRequest,
  GetAllAdminsParams,
  GetAllAdminsResponse,
  UpdateAdminStatusRequest,
} from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/admin`,
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
  tagTypes: ["AdminProfile", "AdminList"],
  endpoints: (builder) => ({
    // 1. Signup Admin (Public)
    signup: builder.mutation<ApiResponse<SignupResponseData>, SignupRequest>({
      query: (credentials) => ({
        url: "/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["AdminList"],
    }),

    // 2. Login Admin (Public)
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["AdminProfile"],
    }),

    // 3. Get Admin Profile (Protected)
    getProfile: builder.query<ApiResponse<IAdmin>, void>({
      query: () => "/profile",
      providesTags: ["AdminProfile"],
    }),

    // 4. Update Admin Profile (Protected)
    updateProfile: builder.mutation<ApiResponse<IAdmin>, UpdateProfileRequest>({
      query: (updateData) => ({
        url: "/profile",
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["AdminProfile", { type: "AdminList", id: "LIST" }],
    }),

    // 5. Change Admin Password (Protected)
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: "/change-password",
        method: "PUT",
        body: passwordData,
      }),
    }),

    // 6. Logout Admin (Protected)
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["AdminProfile", "AdminList"],
    }),

    // 7. Get All Admins (Superadmin only)
    getAllAdmins: builder.query<GetAllAdminsResponse, GetAllAdminsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.Page) queryParams.set("Page", String(params.Page));
        if (params?.Limit) queryParams.set("Limit", String(params.Limit));
        const queryString = queryParams.toString();
        return `/all${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result?.Data
          ? [
              ...result.Data.map((admin) => ({
                type: "AdminList" as const,
                id: admin._id || admin.Id,
              })),
              { type: "AdminList" as const, id: "LIST" },
            ]
          : [{ type: "AdminList" as const, id: "LIST" }],
    }),

    // 8. Update Admin Status / Role (Superadmin only)
    updateAdminStatus: builder.mutation<ApiResponse<IAdmin>, UpdateAdminStatusRequest>({
      query: ({ id, IsActive, Role }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { IsActive, Role },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminList", id },
        { type: "AdminList", id: "LIST" },
        "AdminProfile",
      ],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetAllAdminsQuery,
  useUpdateAdminStatusMutation,
} = adminApi;
