import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { useAuth } from 'shared/auth/useAuth';

function ProtectedRoute({ children }) {
    const { Login_id } = useParams();
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwt_decode(token);
        if (decoded.uid !== Login_id) {
            return <Navigate to="/" replace />;
        }
    } catch (error) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
