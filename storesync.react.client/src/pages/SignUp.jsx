import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from "../UserAuthProvider";

const SignUp = () => {
    const [email, setEmail] = useState();
    const [username, setUsername] = useState();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [password, setPassword] = useState()
    const [confirmPassword, setConfirmPassword] = useState();
    const [error, setError] = useState();
    const { signUpLocalAccount } = useContext(UserAuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (email && username && firstName && lastName && password && confirmPassword) {
            if (password === confirmPassword) {
                const response = await signUpLocalAccount({ email, username, firstName, lastName, password });

                if (response !== true) {
                    setError(response[0]);
                } else {
                    navigate('/');
                }
            } else {
                setError('Your passwords don\'t match.');
            }
        } else {
            setError('Please fill in all required fields.');
        }
    }

    return (
        <div className="container-fluid d-flex flex-row justify-content-center pin-bg">
            <div className="m-auto">
                <div className="login mw-5">
                    <h3 className="mb-3">
                        Hi! Let's get to know you.
                    </h3>
                    <div>
                        <form onSubmit={handleSubmit} className="d-flex flex-column">
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" value={firstName} id="floatingInput" onChange={(e) => setFirstName(e.target.value)} required />
                                <label htmlFor="floatingInput">First Name</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" value={lastName} id="floatingInput" onChange={(e) => setLastName(e.target.value)} required />
                                <label htmlFor="floatingInput">Last Name</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" value={username} id="floatingInput" onChange={(e) => setUsername(e.target.value)} required />
                                <label htmlFor="floatingInput">Username</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" value={email} id="floatingInput" onChange={(e) => setEmail(e.target.value)} required />
                                <label htmlFor="floatingInput">Email</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="password" className="form-control" value={password} id="floatingInput" onChange={(e) => setPassword(e.target.value)} required />
                                <label htmlFor="floatingInput">Password</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="password" className="form-control" value={confirmPassword} id="floatingInput" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                <label htmlFor="floatingInput">Confirm Password</label>
                            </div>
                            <button type='submit' className="btn-primary btn btn-lg">Sign Up</button>
                            <button className="btn-outline-danger btn mt-1" onClick={() => {navigate('/login') } }>Go back</button>
                            {error && <p className="text-danger">{error}</p> }
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp;