import React from 'react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const packages = [
  { name: 'Silver', price: 199, icon: '🥈', features: ['✅ Like upcoming meals', '✅ Request meals', '✅ Profile badge upgrade'] },
  { name: 'Gold', price: 399, icon: '🥇', features: ['✅ All Silver features', '✅ Priority meals', '✅ Early access to reviews'] },
  { name: 'Platinum', price: 599, icon: '💎', features: ['✅ All Gold features', '✅ VIP Support', '✅ Platinum Badge & Priority Queue'] },
];

// র‍্যাঙ্কিং ম্যাপ
const badgeRank = {
  'Bronze': 0,
  'Silver': 1,
  'Gold': 2,
  'Platinum': 3,
};

const MembershipPage = ({ user }) => {
  const navigate = useNavigate();

  const handleUpgradeClick = (pkg) => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please login first',
        text: 'You need to login to upgrade your membership.',
      });
      return;
    }

    const currentBadge = user.badge || 'Bronze';

    const currentRank = badgeRank[currentBadge] ?? 0;
    const pkgRank = badgeRank[pkg.name] ?? 0;

    if (currentRank > pkgRank) {
      // ইউজারের বেডজ বড়, প্যাকেজ ছোট বা পুরানো => কেনা যাবে না
      Swal.fire({
        icon: 'info',
        title: `You already have a higher membership (${currentBadge})`,
        text: `You cannot buy a lower or same package again.`,
      });
      return;
    }

    if (currentRank === pkgRank) {
      // একই প্যাকেজ => বলবে আগে থেকেই আছে
      Swal.fire({
        icon: 'info',
        title: `You already have the ${pkg.name} package`,
        text: 'No need to purchase again!',
      });
      return;
    }

    // এখনই ছোট বা বড় প্যাকেজ কিনতে পারবে (যেমন Bronze থেকে Silver, বা Gold থেকে Platinum)

    if (currentRank < pkgRank && currentRank !== 0) {
      // আপগ্রেডের জন্য কনফার্ম চাইবে
      Swal.fire({
        icon: 'question',
        title: `You already have ${currentBadge} badge`,
        text: `Do you want to upgrade to ${pkg.name}?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, upgrade',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/checkout/${pkg.name}`, { state: { price: pkg.price } });
        }
      });
      return;
    }

    // যদি ব্রোঞ্জ থেকে সরাসরি কিনে
    navigate(`/checkout/${pkg.name}`, { state: { price: pkg.price } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Upgrade Your Membership</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
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
            <button
              onClick={() => handleUpgradeClick(pkg)}
              className="btn btn-sm btn-primary mt-4 w-full"
            >
              Upgrade Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;
