import React from 'react';
import { Link } from 'react-router'; 

const packages = [
  {
    name: 'Silver',
    price: 199,
    icon: '🥈',
    features: [
      '✅ Like upcoming meals',
      '✅ Request meals',
      '✅ Profile badge upgrade',
    ],
  },
  {
    name: 'Gold',
    price: 399,
    icon: '🥇',
    features: [
      '✅ All Silver features',
      '✅ Priority meals',
      '✅ Early access to reviews',
    ],
  },
  {
    name: 'Platinum',
    price: 599,
    icon: '💎',
    features: [
      '✅ All Gold features',
      '✅ VIP Support',
      '✅ Platinum Badge & Priority Queue',
    ],
  },
];

const MembershipPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Upgrade Your Membership</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Link
            key={pkg.name}
            to={`/checkout/${pkg.name}`}
            className="card bg-base-100 shadow-md p-6 hover:border-primary border transition"
          >
            <h3 className="text-xl font-semibold mb-2">
              {pkg.icon} {pkg.name}
            </h3>
            <p className="text-lg mb-4">৳{pkg.price}</p>
            <ul className="text-sm space-y-1">
              {pkg.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <button className="btn btn-sm btn-primary mt-4 w-full">Upgrade Now</button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;
