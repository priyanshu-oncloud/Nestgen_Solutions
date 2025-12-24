import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fade-in">
        
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-14 w-14 text-red-500" />
        </div>

        <h1 className="mb-2 text-6xl font-extrabold text-gray-800 tracking-tight">
          404
        </h1>

        <p className="mb-2 text-xl font-semibold text-gray-700">
          Page Not Found
        </p>

        <p className="mb-6 text-gray-500">
          Sorry, the page you’re looking for doesn’t exist or was moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          <Home className="h-5 w-5" />
          Go Back Home
        </Link>

        <p className="mt-6 text-sm text-gray-400">
          Tried accessing: <span className="font-mono">{location.pathname}</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
