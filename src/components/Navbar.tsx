import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const [sudahLogin, setSudahLogin] = useState(true);

    const Logout = async () => {
        try {
            await axios.delete('https://bendahara-v2-api.herokuapp.com/logout');
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    }

    const ApakahSudahLogin = async () => {
        try {
            const response = await axios.get('https://bendahara-v2-api.herokuapp.com/token');
            console.log("Token navbar", response.data.accessToken);
        } catch {
            setSudahLogin(false);
            console.log("Belum login");
        }
    }

    useEffect(() => {
        ApakahSudahLogin();
    }, []);

    return (
    <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
            <a className="navbar-brand" href="../">Home</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li key="logout" className="nav-item">
                        {sudahLogin &&
                        <button className="btn btn-primary" onClick={() => Logout()}>Logout</button>
                        }
                    </li>
                </ul>
            </div>
        </div>
    </nav>
  )
}

export default Navbar