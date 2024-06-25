import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useContext } from 'react';
import Layout from "./pages/Layout"
import Home from "./pages/Home";
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProductsList from "./pages/ProductsList"
import DebtsList from "./pages/DebtsList"
import DailySales from "./pages/DailySales";
import './App.css';
import { AuthProvider } from "./AuthProvider";
import PrivateRoute from './PrivateRoute';
import Login from "./pages/Login";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute />}>
                        <Route index element={<Home />} />
                        <Route path="dailySales" element={<DailySales />} />
                        <Route path="dashboard/:date" element={<Dashboard />} />
                        <Route path="register" element={<Register />} />
                        <Route path="productsList" element={<ProductsList /> } />
                        <Route path="debtsList" element={<DebtsList /> } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
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