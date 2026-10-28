import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  IBlog,
  GetBlogsParams,
  GetBlogsResponse,
  CreateBlogRequest,
  UpdateBlogRequest,
} from "../types/blog.types";
import type { ApiResponse, AuthRootState } from "../types/admin.types";
import { API_BASE_URL } from "../utils/imageHelper";

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/v1/api/blog`,
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
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // 1. Get all blogs with pagination, search, and category filtering
    getAllBlogs: builder.query<GetBlogsResponse, GetBlogsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.Search) queryParams.set("Search", params.Search);
        if (params?.Category) queryParams.set("Category", params.Category);
        if (params?.IsPublished !== undefined && params?.IsPublished !== "") {
          queryParams.set("IsPublished", String(params.IsPublished));
        }
        if (params?.Page) queryParams.set("Page", String(params.Page));
        if (params?.Limit) queryParams.set("Limit", String(params.Limit));

        const qs = queryParams.toString();
        return qs ? `/?${qs}` : "/";
      },
      providesTags: (result) =>
        result?.Data
          ? [
              ...result.Data.map((blog) => ({
                type: "Blog" as const,
                id: blog._id || blog.Id,
              })),
              { type: "Blog" as const, id: "LIST" },
            ]
          : [{ type: "Blog" as const, id: "LIST" }],
    }),

    // 2. Get blog by ID
    getBlogById: builder.query<ApiResponse<IBlog>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Blog", id }],
    }),

    // 3. Create Blog (Admin Protected)
    createBlog: builder.mutation<ApiResponse<IBlog>, CreateBlogRequest>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),

    // 4. Update Blog (Admin Protected)
    updateBlog: builder.mutation<ApiResponse<IBlog>, UpdateBlogRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
      ],
    }),

    // 5. Delete Blog (Admin Protected)
    deleteBlog: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),

    // 6. Toggle Blog Published Status
    toggleBlogStatus: builder.mutation<
      ApiResponse<IBlog>,
      { id: string; IsPublished: boolean }
    >({
      query: ({ id, IsPublished }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { IsPublished },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useLazyGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleBlogStatusMutation,
} = blogApi;

