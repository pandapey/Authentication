import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const NotFoundPage = () => (
  <AuthLayout
    badge="404"
    title="Page not found"
    subtitle="The page you're looking for doesn't exist or was moved."
  >
    <div className="flex flex-col gap-3">
      <Link to="/" className="btn-primary">
        <Home className="h-5 w-5" aria-hidden="true" />
        Back to home
      </Link>
      <Link to="/dashboard" className="btn-ghost">
        <Compass className="h-5 w-5" aria-hidden="true" />
        Go to dashboard
      </Link>
    </div>
  </AuthLayout>
);

export default NotFoundPage;
