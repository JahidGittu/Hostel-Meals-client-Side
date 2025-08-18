import { Link } from "react-router";
import { FaFaceFrown } from "react-icons/fa6";
import { Helmet } from "react-helmet-async";

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center space-y-6 p-4 text-center">
      <Helmet>
        <title>Error 404 Not Found | Hostel Meals Management System</title>
      </Helmet>

      <div className="flex items-center text-9xl font-bold">
        <span className="text-white">4</span>
        <span className="mx-4 text-purple-500">=</span>
        <span className="text-white">4</span>
      </div>

      <div className="text-5xl text-yellow-400">
        <FaFaceFrown />
      </div>

      <p className="max-w-md text-gray-400">
        The page you're looking for can't be found. It looks like you're trying
        to access a page that either has been deleted or never existed.
      </p>

      <Link
        to="/"
        className="btn btn-warning text-black font-semibold px-6 py-2 rounded shadow hover:shadow-lg transition-all"
      >
        Back to HOME PAGE
      </Link>
    </div>
  );
};

export default ErrorPage;
