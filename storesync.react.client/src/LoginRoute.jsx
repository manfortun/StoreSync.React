import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuthContext } from './UserAuthProvider';
import Layout from './pages/Layout';

const UserRoute = ({ component: Component, ...rest }) => {
    const { user } = useContext(UserAuthContext);

    return user ?
        <Layout {...rest} /> :
        <Navigate to="/login" replace state={{ from: rest.location }} />;
};

export default UserRoute;