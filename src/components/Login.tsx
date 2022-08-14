import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const Login = () => {
    const [form, setForm] = useState<{email: string, password: string}>({
        email: "",
        password: "",
    });
    const [pesan, setPesan] = useState('');
    const navigate = useNavigate();

    const url = "https://bendahara-v2-api.herokuapp.com"; // https://bendahara-v2-api.herokuapp.com
    
    const ApakahSudahLogin = async () => {
        try {
            const resp = await axios.get(`${url}/token`);
            const Token = resp.data.accessToken || Cookies.get('accessToken');
            // const Token = Cookies.get('accessToken');

            if(Token !== undefined) {
                const decoded: {UserId: string} = jwt_decode(Token);
                navigate('/bendahara/'+decoded.UserId);
            }
        } catch(e) {
            console.log("Belum login")
        }
    }
    ApakahSudahLogin();

    const Login = async () => {        
        try {
            const hasil = await axios.post(`${url}/login`, {
                email: form.email,
                password: form.password,
            });
            Cookies.set('accessToken', hasil.data.accessToken, {expires: 1});
            navigate(`/bendahara/${hasil.data.id}`);
        } catch (error: any) {
            if(error.response) {
                console.log(error.response.data.msg);
                setPesan(error.response.data.msg);
            }
        }
    }

    return (
    <section className="vh-100" style={{backgroundColor: "#508bfc"}}>
        <div className="container py-5 h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card shadow-2-strong" style={{borderRadius: "1rem"}}>
                        <div className="card-body p-5 text-center">

                            <h3 className="mb-5">Sign in</h3>

                            <div className="form-outline mb-4">
                                <input type="email" id="typeEmailX-2" className="form-control form-control-lg" onChange={(e) => setForm({...form, email: e.target.value})} />
                                <label className="form-label">Email</label>
                            </div>

                            <div className="form-outline mb-4">
                                <input type="password" id="typePasswordX-2" className="form-control form-control-lg" onChange={(e) => setForm({...form, password: e.target.value})} />
                                <label className="form-label">Password</label>
                            </div>

                            <button className="btn btn-primary btn-lg btn-block" onClick={() => Login()}>Login</button>
                            <br />
                            Tidak punya akun? <a href="/register">Buat akun!</a>

                            <hr className="my-4" />
                            <h3>{pesan}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Login;
