import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Use relative URL so Vite dev proxy (localhost:3000) and production
// same-origin serving both work without CORS issues.
const API_URL = "/api/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

// create api slice

export const apiSlice = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: ({ email, password, name }) => ({
        url: "/signup",
        method: "POST",
        body: { email, password, name },
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/login",
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyEmail: builder.mutation({
      query: (code) => ({
        url: "/verify-email",
        method: "POST",
        body:
          typeof code === "object"
            ? code
            : { code },
      }),
      invalidatesTags: ["Auth"],
    }),
    resendVerification: builder.mutation({
      query: (email) => ({
        url: "/resend-verification",
        method: "POST",
        body: { email: typeof email === "object" ? email.email : email },
      }),
    }),
    checkAuth: builder.query({
      query: () => ({
        url: "/check-auth",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        body: { email: typeof email === "object" ? email.email : email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCheckAuthQuery,
  useLazyCheckAuthQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = apiSlice;
