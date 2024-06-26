import { useContext, useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from '../UserAuthProvider';
import "./Login.css";

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState();
    const { isLoggedIn, user, loginLocalAccount, loginGoogleAccount } = useContext(UserAuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (username && password) {
            const response = await loginLocalAccount({ username, password });

            if (response === false) {
                setError('Username or password is incorrect.');
            }
        } else {
            setError('You forgot a field there.')
        }
    }

    const handleGoogleLogin = (event) => {
        event.preventDefault();

        loginGoogleAccount();
    }

    return (
        <div className="container-fluid d-flex flex-row justify-content-center pin-bg">
            <div className="m-auto">
                <div className="login mw-5">
                    <h2 className="mb-4">Log in</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" value={username} id="floatingInput" onChange={(e) => setUsername(e.target.value)} required/>
                            <label htmlFor="floatingInput">Username</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" value={password} id="floatingInput" onChange={(e) => setPassword(e.target.value)} required/>
                            <label htmlFor="floatingInput">Password</label>
                        </div>
                        <button className="btn form-control btn-lg btn-primary" type="submit">Let's start!</button>
                    </form>
                    {error && <p className="text-danger">{error}</p> }
                    <div className="mt-2">
                        <small>
                            <span>Don't have an account? </span><a className="text-primary m-0 p-0" href="/signup">Sign up</a>
                        </small>
                    </div>
                    <div className="margin-auto mt-3 d-flex flex-row justify-content-center">
                        <FcGoogle className="fs-2 clickable" onClick={(e) => handleGoogleLogin(e)} title="Login using Google." />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserLogin;