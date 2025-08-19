import React from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";

const packages = [
  {
    name: "Silver",
    price: 199,
    icon: "🥈",
    color: "from-gray-200 to-gray-400",
    features: [
      "✅ Like upcoming meals",
      "✅ Request meals",
      "✅ Profile badge upgrade",
    ],
  },
  {
    name: "Gold",
    price: 399,
    icon: "🥇",
    color: "from-yellow-300 to-yellow-500",
    features: [
      "✅ All Silver features",
      "✅ Priority meals",
      "✅ Early access to reviews",
    ],
  },
  {
    name: "Platinum",
    price: 599,
    icon: "💎",
    color: "from-blue-300 to-blue-600",
    features: [
      "✅ All Gold features",
      "✅ VIP Support",
      "✅ Platinum Badge & Priority Queue",
    ],
  },
];

const MembershipPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgradeClick = (pkg) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Please login first",
        text: "You need to login to upgrade your membership.",
      });
      return;
    }

    const currentBadge = currentUser?.badge || "Bronze";

    const badgeRank = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 };

    const currentRank = badgeRank[currentBadge] ?? 0;
    const pkgRank = badgeRank[pkg.name] ?? 0;

    if (currentRank > pkgRank) {
      Swal.fire({
        icon: "info",
        title: `You already have a higher membership (${currentBadge})`,
        text: `You cannot buy a lower or same package again.`,
      });
      return;
    }

    if (currentRank === pkgRank) {
      Swal.fire({
        icon: "info",
        title: `You already have the ${pkg.name} package`,
        text: "No need to purchase again!",
      });
      return;
    }

    if (currentRank < pkgRank && currentRank !== 0) {
      Swal.fire({
        icon: "question",
        title: `You already have ${currentBadge} badge`,
        text: `Do you want to upgrade to ${pkg.name}?`,
        showCancelButton: true,
        confirmButtonText: "Yes, upgrade",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/checkout/${pkg.name}`, { state: { price: pkg.price } });
        }
      });
      return;
    }

    navigate(`/checkout/${pkg.name}`, { state: { price: pkg.price } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-12"
      >
        Upgrade Your <span className="text-primary">Membership</span>
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl shadow-lg p-8 bg-gradient-to-br ${pkg.color} text-white relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-20">
              {pkg.icon}
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {pkg.icon} {pkg.name}
            </h3>
            <p className="text-3xl font-extrabold mb-6">৳{pkg.price}</p>
            <ul className="space-y-2 mb-6 text-lg">
              {pkg.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgradeClick(pkg)}
              className="btn btn-primary w-full"
            >
              Upgrade Now
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;
