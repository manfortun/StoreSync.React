import { useState, useEffect, createContext } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import LoadingScreen from './pages/LoadingScreen';

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const googleUserToken = 'googleToken';
    const localUserToken = 'localUserToken';

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('User set: ', user);
        } else {
            console.log('User removed.');
        }
    }, [user]);

    useEffect(() => {
        const init = async () => {
            const token = getToken();
            if (token) {
                if (token.type === googleUserToken) {
                    const googleUser = await getGoogleUserUsingAccessToken(token.token);

                    if (googleUser) {
                        logInUser(googleUser);
                    }
                } else if (token.type === localUserToken) {
                    const localUser = getLocalUserUsingAccessToken(token.token);

                    if (localUser) {
                        logInUser(localUser);
                    }
                }
            }
            setLoading(false);
        };

        init();
    }, []);

    const logInUser = (user) => {
        if (user) {
            setUser(user);
            setIsLoggedIn(true);
        }
    }

    const logoutUser = () => {
        setIsLoggedIn(false);
        googleLogout();
        setUser(null);
        localStorage.removeItem(googleUserToken);
        localStorage.removeItem(localUserToken);
    }

    const getToken = () => {
        let token = localStorage.getItem(localUserToken);
        if (token) {
            return { token, type: localUserToken };
        } else {
            token = localStorage.getItem(googleUserToken);
            if (token) {
                return { token, type: googleUserToken };
            }
        }

        return null;
    }

    const getGoogleUserUsingAccessToken = async (token) => {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (response) {
            return response.data;
        } else {
            return null;
        }
    }

    const getLocalUserUsingAccessToken = (token) => {
        const localUser = jwtDecode(token);
        return localUser;
    }

    const setTokenToLocalStorage = (token, type) => {
        const tokenToRemove = type === localUserToken ? googleUserToken : localUserToken;

        localStorage.removeItem(tokenToRemove);
        localStorage.setItem(type, token);
    }

    const loginGoogleAccount = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await loginGoogleUserUsingAccessToken(tokenResponse.access_token);
            } catch (err) {
                console.log(err);
            }
        },
        onError: (error) => {
            console.log('Login Failed:', error);
        }
    });

    const loginGoogleUserUsingAccessToken = async (accessToken) => {
        try {
            const googleUser = await getGoogleUserUsingAccessToken(accessToken);
            logInUser(googleUser);
            setTokenToLocalStorage(accessToken, googleUserToken);
        } catch (error) {
            console.error(error);
        }
    }

    const loginLocalAccount = async ({ username, password }) => {
        try {
            const response = await axios.get(`${BASE_URL}/Login/LoginUser`, {
                params: {
                    username: username,
                    password: password
                }
            });

            if (response.data.token) {
                const decodedUser = jwtDecode(response.data.token);
                logInUser(decodedUser);
                setTokenToLocalStorage(response.data.token, localUserToken);

                return true;
            }
        } catch (error) {
            console.log(error);
        }

        return false;
    };

    const signUpLocalAccount = async (signUpDetails) => {
        try {
            const response = await axios.post(`${BASE_URL}/Login/SignUp`, signUpDetails);

            if (response.data) {
                const decodedUser = jwtDecode(response.data.token);
                logInUser(decodedUser);
                setTokenToLocalStorage(response.data, localUserToken);

                return true;
            }
        } catch (error) {
            return error.response.data;
        }
    }

    const getLoggedUser = () => {
        const token = getToken();

        if (token && user) {
            if (token.type === googleUserToken) {
                return {
                    picture: user.picture,
                    display_name: user.given_name
                };
            } else if (token.type === localUserToken) {
                return {
                    display_name: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
                };
            }
        }

        return null;
    }

    if (loading) {
        return <LoadingScreen message="Please wait..." ></LoadingScreen>;
    }

    return (
        <UserAuthContext.Provider value={{ user, isLoggedIn, getLoggedUser, logoutUser, loginLocalAccount, signUpLocalAccount, loginGoogleAccount }}>
            {children}
        </UserAuthContext.Provider>
    );
}