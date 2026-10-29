import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, IAdmin } from "../types/admin.types";
import { adminApi } from "../api/adminApi";

const initialState: AuthState = {
  token: null,
  admin: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; admin?: IAdmin }>
    ) => {
      const { token, admin } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", token);
      }

      if (admin) {
        state.admin = admin;
        state.isSuperAdmin = admin.Role === "superadmin";
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_profile", JSON.stringify(admin));
        }
      }
    },
    setAdmin: (state, action: PayloadAction<IAdmin>) => {
      state.admin = action.payload;
      state.isSuperAdmin = action.payload.Role === "superadmin";
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_profile", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.isSuperAdmin = false;
      state.isInitialized = true;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_profile");
      }
    },
    initializeAuth: (state) => {
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin_token");
        const adminStr = localStorage.getItem("admin_profile");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
        if (adminStr) {
          try {
            const admin = JSON.parse(adminStr) as IAdmin;
            state.admin = admin;
            state.isSuperAdmin = admin.Role === "superadmin";
          } catch {
            localStorage.removeItem("admin_profile");
          }
        }
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login fulfilled
    builder.addMatcher(
      adminApi.endpoints.login.matchFulfilled,
      (state, action) => {
        const token = action.payload.Data?.Token;
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", token);
          }
        }
      }
    );

    // Signup fulfilled
    builder.addMatcher(
      adminApi.endpoints.signup.matchFulfilled,
      (state, action) => {
        const token = action.payload.Data?.Token;
        const admin = action.payload.Data?.Admin;
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", token);
          }
        }
        if (admin) {
          state.admin = admin;
          state.isSuperAdmin = admin.Role === "superadmin";
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_profile", JSON.stringify(admin));
          }
        }
      }
    );

    // Get Profile fulfilled
    builder.addMatcher(
      adminApi.endpoints.getProfile.matchFulfilled,
      (state, action) => {
        if (action.payload.Data) {
          state.admin = action.payload.Data;
          state.isSuperAdmin = action.payload.Data.Role === "superadmin";
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "admin_profile",
              JSON.stringify(action.payload.Data)
            );
          }
        }
      }
    );

    // Update Profile fulfilled
    builder.addMatcher(
      adminApi.endpoints.updateProfile.matchFulfilled,
      (state, action) => {
        if (action.payload.Data) {
          state.admin = action.payload.Data;
          state.isSuperAdmin = action.payload.Data.Role === "superadmin";
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "admin_profile",
              JSON.stringify(action.payload.Data)
            );
          }
        }
      }
    );

    // Update Admin Permissions fulfilled
    builder.addMatcher(
      adminApi.endpoints.updateAdminPermissions.matchFulfilled,
      (state, action) => {
        const updated = action.payload.Data;
        if (
          updated &&
          (state.admin?._id === updated._id ||
            state.admin?.Id === updated._id ||
            state.admin?._id === updated.Id)
        ) {
          state.admin = updated;
          state.isSuperAdmin = updated.Role === "superadmin";
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_profile", JSON.stringify(updated));
          }
        }
      }
    );

    // Logout fulfilled
    builder.addMatcher(
      adminApi.endpoints.logout.matchFulfilled,
      (state) => {
        state.token = null;
        state.admin = null;
        state.isAuthenticated = false;
        state.isSuperAdmin = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_profile");
        }
      }
    );
  },
});

export const { setCredentials, setAdmin, logout, initializeAuth, setError } =
  authSlice.actions;

export default authSlice.reducer;
