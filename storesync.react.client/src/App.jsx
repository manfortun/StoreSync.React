import { GoogleOAuthProvider } from "@react-oauth/google";
import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthClientId } from "../utils/constants";
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
export default function App() {
    return (
        <GoogleOAuthProvider clientId={GoogleOAuthClientId}>
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