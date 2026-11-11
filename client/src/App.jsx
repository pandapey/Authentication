import { useEffect } from "react";
import AuroraBackground from "./components/AuroraBackground";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import { Toaster } from "react-hot-toast";
import { setUser, setCheckingAuth, logoutUser } from "./slices/authSlice";
import { useCheckAuthQuery } from "./slices/apiSlice";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Route component that checks if the user is authenticated and verified
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useSelector(
    (state) => state.auth
  );

  if (isCheckingAuth) {
    return <LoadingSpinner label="Checking your session…" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// RedirectAuthenticatedUser component that redirects authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useSelector(
    (state) => state.auth
  );
  const { pathname } = useLocation();

  if (isCheckingAuth) {
    return <LoadingSpinner label="Checking your session…" />;
  }

  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  // Signed up but email not verified yet (e.g. after a reload on
  // /signup or /login) → continue the flow where it left off.
  if (
    isAuthenticated &&
    user &&
    !user.isVerified &&
    (pathname === "/signup" || pathname === "/login")
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  // NOTE: no AnimatePresence "wait" gate here on purpose — it held the
  // previous screen mounted after signup, so the URL changed to
  // /verify-email while the signup card stayed visible until reload.
  // Route changes are synchronous now; every page still plays its own
  // enter animation on mount.
  return (
    <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/verify-email"
          element={
            <RedirectAuthenticatedUser>
              <EmailVerificationPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { data, isLoading, isFetching, isSuccess, isError } =
    useCheckAuthQuery();

  useEffect(() => {
    dispatch(setCheckingAuth(isLoading || isFetching));
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
    } else if (isError) {
      dispatch(logoutUser());
    }
  }, [data, isSuccess, isError, isLoading, isFetching, dispatch]);

  if (isLoading) {
    return (
      <div className="noise relative flex min-h-screen flex-col overflow-x-clip bg-ink-950">
        <AuroraBackground />
        <LoadingSpinner label="Waking up Aurora…" />
      </div>
    );
  }

  return (
    <div className="noise relative flex min-h-screen flex-col overflow-x-clip bg-ink-950">
      <AuroraBackground />
      <ScrollToTop />
      <Header />

      <main
        id="main"
        className="relative z-10 flex flex-1 items-center justify-center py-8 sm:py-12"
      >
        <AnimatedRoutes />
      </main>

      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 5000,
          style: {
            background: "rgba(11,17,32,.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "14px",
            backdropFilter: "blur(12px)",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#34d399", secondary: "#070b16" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#070b16" },
          },
        }}
      />

      <Footer />
    </div>
  );
};

export default App;
