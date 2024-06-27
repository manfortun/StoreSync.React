import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import LoginRoute from "./LoginRoute";
import { UserAuthProvider } from "./UserAuthProvider";
import DailySales from "./pages/DailySales";
import Dashboard from "./pages/Dashboard";
import DebtsList from "./pages/DebtsList";
import Home from "./pages/Home";
import ProductsList from "./pages/ProductsList";
import Register from "./pages/Register";
import SignUp from "./pages/SignUp";
import UserLogin from "./pages/UserLogin";
import LoadingScreen from "./pages/LoadingScreen";
import axios from 'axios';
import { BASE_URL } from "../utils/constants";
export default function App() {
    const [googleClientId, setGoogleClientId] = useState();

    useEffect(() => {
        const getClientId = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/Auth/Google/${0}`);

                if (response.data) {
                    setGoogleClientId(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        }

        getClientId();
    }, []);

    if (!googleClientId) {
        return <LoadingScreen message="Connecting to the server..." ></LoadingScreen>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <UserAuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/signup" element={<SignUp/> }/>
                        <Route path="/" element={<LoginRoute />}>
                            <Route index element={<Home />} />
                            <Route path="dailySales" element={<DailySales />} />
                            <Route path="dashboard/:date" element={<Dashboard />} />
                            <Route path="register" element={<Register />} />
                            <Route path="productsList" element={<ProductsList /> } />
                            <Route path="debtsList" element={<DebtsList /> } />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </UserAuthProvider>
        </GoogleOAuthProvider>
    );
}

//export default function App() {
//    return (
//        <BrowserRouter>
//            <Routes>
//                <Route path="/" element={<Layout />}>
//                    <Route index element={<Home />} />
//                    <Route path="dailySales" element={<DailySales />} />
//                    <Route path="dashboard/:date" element={<Dashboard />} />
//                    <Route path="register" element={<Register />} />
//                    <Route path="productsList" element={<ProductsList /> } />
//                    <Route path="debtsList" element={<DebtsList /> } />
//                </Route>
//            </Routes>
//        </BrowserRouter>
//    )
//}