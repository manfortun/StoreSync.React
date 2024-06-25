import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BASE_URL } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    AuthProvider.propTypes = {
        children: PropTypes.node.isRequired,
    };

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
        }
        setLoading(false);
    }, []);

    const login = async (pin) => {
        try {
            const response = await axios.post(`${BASE_URL}/Login`, { pin });
            const token = response.data.token;

            localStorage.setItem('token', token);

            const decodedUser = jwtDecode(token);
            setUser(decodedUser);

            return decodedUser;
        } catch (error) {
            console.error('Login failed', error);
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        console.log('User state changed:', user);
    }, [user]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};