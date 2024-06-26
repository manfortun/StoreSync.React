import { useContext, useEffect, useState } from 'react';
import { BsArchiveFill, BsBoxArrowInRight, BsCreditCard2BackFill, BsFillHouseFill, BsPersonCircle, BsSpeedometer, BsUpcScan } from 'react-icons/bs';
import { Outlet } from "react-router-dom";
import { UserAuthContext } from '../UserAuthProvider';
import "./Layout.css";

const Layout = () => {
    const context = useContext(UserAuthContext);
    const [loggedUser, setLoggedUser] = useState();

    useEffect(() => {
        const logged = context.getLoggedUser();
        setLoggedUser(logged);
    }, [context])

    return (
        <>
            <div className="d-flex flex-row bg-primary p-3 align-items-center">
                <div className="position-absolute d-md-flex d-none">
                    <a href="/"><h5 className="mb-1">Store Sync</h5></a>
                </div>
                <div className="d-flex flex-row justify-content-center w-100">
                    <a className="hover" href="/"><BsFillHouseFill className="mb-1 d-md-none d-flex" title="Home"></BsFillHouseFill> <span className="d-none d-md-flex">Home</span></a>
                    <a className="hover" href="/dailySales"><BsSpeedometer className="mb-1 d-md-none d-flex" title="Dashboard"></BsSpeedometer>  <span className="d-none d-md-flex">Dashboard</span></a>
                    <a className="hover" href="/productsList"><BsArchiveFill className="mb-1 d-md-none d-flex" title="Products"></BsArchiveFill>  <span className="d-none d-md-flex">Products</span></a>
                    <a className="hover" href="/register"><BsUpcScan className="mb-1 d-md-none d-flex" title="Register"></BsUpcScan>  <span className="d-none d-md-flex">Register</span></a>
                    <a className="hover" href="/debtsList"><BsCreditCard2BackFill className="mb-1 d-md-none d-flex" title="Debts"></BsCreditCard2BackFill>  <span className="d-none d-md-flex">Debts</span></a>
                </div>
                <div className="ms-auto d-flex flex-row justify-content-center align-items-center">
                    {context && loggedUser && (
                        <div className="text-white nowrap me-2 d-flex flex-row justify-content-center align-items-center">
                            {loggedUser.picture ? (
                                <img src={loggedUser.picture} height={30} alt={loggedUser.display_name} className="circular-img me-2" />
                            ) : (
                                    <BsPersonCircle className="me-2" />
                            )}
                            <span>
                                Hi {loggedUser.display_name}!
                            </span>
                        </div>
                    )}
                    <button className="btn text-white p-0 fs-5 me-3 m-0 d-flex flex-row justify-content-center align-items-center" title="Logout" onClick={() => context.logoutUser()}><BsBoxArrowInRight /></button>
                </div>
            </div>

            <Outlet />
        </>
    )
};

export default Layout;