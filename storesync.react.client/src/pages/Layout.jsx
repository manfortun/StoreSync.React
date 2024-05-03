import { Outlet, Link } from "react-router-dom";
import { BsFillHouseFill } from 'react-icons/bs';
import "./Layout.css"

const Layout = () => {
    return (
        <>
            <div className="d-flex flex-row bg-primary p-3 align-items-center">
                <div className="position-absolute">
                    <a href="/"><h5 className="mb-1">StoreSync</h5></a>
                </div>
                <div className="d-flex flex-row justify-content-center w-100">
                    <a className="hover" href="/dashboard">Dashboard</a>
                    <a className="hover" href="/"><BsFillHouseFill className="mb-1"></BsFillHouseFill> Home</a>
                    <a className="hover" href="/register">Register</a>
                </div>
            </div>

            <Outlet />
        </>
    )
};

export default Layout;