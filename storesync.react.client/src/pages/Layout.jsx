import { BsArchiveFill, BsCreditCard2BackFill, BsFillHouseFill, BsSpeedometer, BsUpcScan } from 'react-icons/bs';
import { Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
    return (
        <>
            <div className="d-flex flex-row bg-primary p-3 align-items-center">
                <div className="position-absolute d-md-flex d-none">
                    <a href="/"><h5 className="mb-1">Benny's Store</h5></a>
                </div>
                <div className="d-flex flex-row justify-content-center w-100">
                    <a className="hover" href="/"><BsFillHouseFill className="mb-1 d-md-none d-flex" title="Home"></BsFillHouseFill> <span className="d-none d-md-flex">Home</span></a>
                    <a className="hover" href="/dailySales"><BsSpeedometer className="mb-1 d-md-none d-flex" title="Dashboard"></BsSpeedometer>  <span className="d-none d-md-flex">Dashboard</span></a>
                    <a className="hover" href="/productsList"><BsArchiveFill className="mb-1 d-md-none d-flex" title="Products"></BsArchiveFill>  <span className="d-none d-md-flex">Products</span></a>
                    <a className="hover" href="/register"><BsUpcScan className="mb-1 d-md-none d-flex" title="Register"></BsUpcScan>  <span className="d-none d-md-flex">Register</span></a>
                    <a className="hover" href="/debtsList"><BsCreditCard2BackFill className="mb-1 d-md-none d-flex" title="Debts"></BsCreditCard2BackFill>  <span className="d-none d-md-flex">Debts</span></a>
                </div>
            </div>

            <Outlet />
        </>
    )
};

export default Layout;