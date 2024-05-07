import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout"
import Home from "./pages/Home";
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProductsList from "./pages/ProductsList"
import DebtsList from "./pages/DebtsList"
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="register" element={<Register />} />
                    <Route path="productsList" element={<ProductsList /> } />
                    <Route path="debtsList" element={<DebtsList /> } />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}