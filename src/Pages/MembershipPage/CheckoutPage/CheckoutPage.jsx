import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import useSecureAxios from '../../../hooks/useSecureAxios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);

const CheckoutPage = () => {
    const { package_name } = useParams();
    const secureAxios = useSecureAxios();
    const [clientSecret, setClientSecret] = useState('');
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const prices = {
            Silver: 199,
            Gold: 399,
            Platinum: 599,
        };

        const selectedPrice = prices[package_name];

        if (!selectedPrice) return;

        const fetchClientSecret = async () => {
            try {
                const res = await secureAxios.post('/create-payment-intent', {
                    packageName: package_name,
                    price: selectedPrice,
                });

                setClientSecret(res.data.clientSecret);
                setPrice(selectedPrice);
            } catch (err) {
                console.error('Payment intent error:', err);
            }
        };

        fetchClientSecret();
    }, [package_name, secureAxios]);

    const appearance = {
        theme: 'stripe',
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="max-w-xl mx-auto mt-20 p-6 shadow rounded-lg">

            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm
                        packageName={package_name}
                        clientSecret={clientSecret}
                        price={price}
                    />

                </Elements>
            ) : (
                <p className="text-center">Loading payment gateway...</p>
            )}
        </div>
    );
};

export default CheckoutPage;
