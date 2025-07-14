import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router'; // useLocation ইম্পোর্ট করলাম
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useSecureAxios from '../../../hooks/useSecureAxios';
import {
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaCcDiscover,
} from 'react-icons/fa';

const CheckoutForm = ({ packageName, price, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();
    const secureAxios = useSecureAxios();
    const navigate = useNavigate();
    const location = useLocation(); 

    console.log(location)

    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setProcessing(true);

        const card = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card,
                    billing_details: {
                        name: user?.displayName || 'Unknown',
                        email: user?.email,
                    },
                },
            }
        );

        if (error) {
            Swal.fire('Payment Error', error.message, 'error');
            setProcessing(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            await secureAxios.post('/payments', {
                email: user.email,
                packageName,
                price,
                transactionId: paymentIntent.id,
            });

            await Swal.fire('Success', 'Membership upgraded successfully!', 'success');

            // এখানে location.state থেকে redirect পাথ নেবো, নাহলে ডিফল্ট
            const redirectPath = location.state?.from || '/dashboard/profile';

            navigate(redirectPath);
        }

        setProcessing(false);
    };

    return (
        <div className="max-w-lg mx-auto mt-16 bg-gradient-to-br from-[#E0F7FA] to-[#E1F5FE] p-8 shadow-xl rounded-2xl space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Complete Your Payment
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                    Package: <span className="text-primary">{packageName}</span>
                </p>
                <p className="text-xl font-bold text-primary">৳{price}</p>
            </div>

            {/* Apple Pay style button (optional UI only) */}
            <div className="text-center">
                <button
                    type="button"
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium mb-4"
                >
                     Pay
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <input
                    type="text"
                    value={user?.displayName || ''}
                    placeholder="Full Name"
                    disabled
                    className="input input-bordered w-full"
                />

                {/* Address (optional input field) */}
                <input
                    type="text"
                    placeholder="Street address"
                    className="input input-bordered w-full"
                />

                {/* Card section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="font-semibold">Card Details</label>
                        <div className="flex gap-2 text-2xl text-gray-500">
                            <FaCcVisa />
                            <FaCcMastercard />
                            <FaCcAmex />
                            <FaCcDiscover />
                        </div>
                    </div>

                    <div className="border border-blue-300 bg-white rounded-lg p-4">
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#1a202c',
                                        fontFamily: 'monospace',
                                        '::placeholder': { color: '#a0aec0' },
                                    },
                                    invalid: { color: '#e53e3e' },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Pay Button */}
                <button
                    type="submit"
                    disabled={!stripe}
                    className={processing ? "btn btn-primary w-full rounded-xl text-lg font-semibold cursor-not-allowed" : "btn btn-primary w-full rounded-xl text-lg font-semibold"}
                >
                    {processing ? `Processing...` : `Pay ৳${price}`}
                </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
                🔐 Your payment is secure and encrypted by Stripe
            </p>
        </div>
    );
};

export default CheckoutForm;
