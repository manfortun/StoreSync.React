import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import Layout from './pages/Layout';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useContext(AuthContext);

    return user ?
        <Layout {...rest} /> :
        <Navigate to="/login" replace state={{ from: rest.location }} />;
};

export default PrivateRoute;