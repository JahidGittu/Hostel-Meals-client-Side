import { Link } from "react-router";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { CiLocationArrow1 } from "react-icons/ci";
import useAuth from "../../../hooks/useAuth";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleInputFocus = () => {
    if (user?.email) {
      setEmail(user.email);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      return setMessage("Please enter a valid email.");
    }
    try {
      setLoading(true);
      setMessage("");
      // Replace with your API call or integration logic
      await new Promise((res) => setTimeout(res, 1500)); // simulate delay
      setMessage("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (err) {
      setMessage("Subscription failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-base-300 text-base-content">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Section 1: Site Info */}
        <div>
          <h2 className="text-xl font-bold mb-2 text-primary">HostelMate</h2>
          <p className="text-sm text-gray-600">
            Smart Hostel Management System for your university needs. Built with MERN Stack and crafted for convenience.
          </p>
        </div>

        {/* Section 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/meals" className="hover:underline">Meals</Link></li>
            <li><Link to="/upcoming-meals" className="hover:underline">Upcoming Meals</Link></li>
            <li><Link to="/join" className="hover:underline">Join Us</Link></li>
            <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
          </ul>
        </div>

        {/* Section 3: Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Contact</h3>
          <p className="text-sm">Email: <a href="mailto:hostelmate@university.com" className="underline">hostelmate@university.com</a></p>
          <p className="text-sm">Phone: +880 123 456 789</p>
          <p className="text-sm">Location: University Campus, Bangladesh</p>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <h3 className="text-xl font-semibold text-center mb-4">Subscribe to Our Newsletter</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleInputFocus}
            className="flex-1 p-3 rounded-md border border-gray-300 w-full"
            disabled={loading}
          />
          <button
            onClick={handleSubscribe}
            className="btn btn-primary text-white"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <CiLocationArrow1 size={20} />}
            <span className="ml-2">Subscribe</span>
          </button>
        </div>
        {message && (
          <p className={`text-sm text-center mt-2 ${message.includes("failed") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-300">
        &copy; {new Date().getFullYear()} HostelMate. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
