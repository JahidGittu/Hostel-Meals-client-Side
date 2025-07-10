import React from 'react';

const Unauthorized = () => {
    return (
        <div>
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
                <p className="text-lg mt-4">You are not authorized to view this page.</p>
            </div>
        </div>
    );
};

export default Unauthorized;