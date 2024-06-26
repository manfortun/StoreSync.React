import { useContext, useState } from 'react';
import { BsFillLockFill } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider';
import "./Login.css";

const Login = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = await login(pin);
        console.log(user);
        if (user) {
            navigate('/');
        } else {
            setError('Invalid pin.');
        }
    }

    return (
        <div className="container-fluid d-flex flex-row justify-content-center pin-bg">
            <div className="m-auto">
                <div className="login">
                    <div className="d-flex flex-row align-items-center mb-3">
                        <BsFillLockFill className="me-2"/>
                        <span className="fs-4">Enter pin: </span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input className="form-control mb-2 text-center" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />
                        {error && <p className="text-danger">{error}</p>}
                        <div className="d-flex flex-row justify-content-center">
                            <button type="submit" className="btn btn-outline-primary">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default Login;