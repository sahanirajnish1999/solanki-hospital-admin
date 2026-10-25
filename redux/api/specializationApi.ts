import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ISpecialization,
  GetAllSpecializationsParams,
  GetAllSpecializationsResponse,
  CreateSpecializationRequest,
  UpdateSpecializationRequest,
} from "../types/specialization.types";
import type { ApiResponse, AuthRootState } from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const specializationApi = createApi({
  reducerPath: "specializationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/specialization`,
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
  tagTypes: ["Specialization"],
  endpoints: (builder) => ({
    // 1. Get all specializations (Public / Admin)
    getAllSpecializations: builder.query<
      GetAllSpecializationsResponse,
      GetAllSpecializationsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.Search) queryParams.set("Search", params.Search);
        if (params?.IsActive !== undefined)
          queryParams.set("IsActive", String(params.IsActive));
        if (params?.All) queryParams.set("All", "true");
        if (params?.Page) queryParams.set("Page", String(params.Page));
        if (params?.Limit) queryParams.set("Limit", String(params.Limit));

        const qs = queryParams.toString();
        return qs ? `/?${qs}` : "/";
      },
      providesTags: (result) =>
        result?.Data
          ? [
              ...result.Data.map((spec) => ({
                type: "Specialization" as const,
                id: spec._id || spec.Id,
              })),
              { type: "Specialization" as const, id: "LIST" },
            ]
          : [{ type: "Specialization" as const, id: "LIST" }],
    }),

    // 2. Get specialization by ID
    getSpecializationById: builder.query<ApiResponse<ISpecialization>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Specialization", id }],
    }),

    // 3. Create Specialization (Admin)
    createSpecialization: builder.mutation<
      ApiResponse<ISpecialization>,
      CreateSpecializationRequest
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Specialization", id: "LIST" }],
    }),

    // 4. Update Specialization (Admin)
    updateSpecialization: builder.mutation<
      ApiResponse<ISpecialization>,
      UpdateSpecializationRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Specialization", id },
        { type: "Specialization", id: "LIST" },
      ],
    }),

    // 5. Delete Specialization (Admin)
    deleteSpecialization: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Specialization", id: "LIST" }],
    }),

    // 6. Toggle Specialization Status (Admin)
    toggleSpecializationStatus: builder.mutation<
      ApiResponse<ISpecialization>,
      { id: string; IsActive?: boolean }
    >({
      query: ({ id, IsActive }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { IsActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Specialization", id },
        { type: "Specialization", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllSpecializationsQuery,
  useGetSpecializationByIdQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
  useToggleSpecializationStatusMutation,
} = specializationApi;
