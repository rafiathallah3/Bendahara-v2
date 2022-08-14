import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const [sudahLogin, setSudahLogin] = useState(true);
    const url = "http://localhost:3001"; // https://bendahara-v2-api.herokuapp.com

    const Logout = async () => {
        try {
            await axios.delete(`${url}/logout`);
            Cookies.remove('accessToken');
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    }

    const ApakahSudahLogin = async () => {
        try {
            const response = await axios.get(`${url}/token`);
            // console.log("Sudah login")
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
            {sudahLogin &&
            <button className="btn btn-primary" onClick={() => Logout()}>Logout</button>
            }
        </div>
    </nav>
  )
}

export default Navbar