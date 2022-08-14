import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [form, setForm] = useState<{name: string, email: string, password: string, confirmPassword: string}>({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [pesan, setPesan] = useState('');
    const navigate = useNavigate();
    const url = "http://localhost:3001"; // https://bendahara-v2-api.herokuapp.com

    const Register = async () => {        
        try {
            await axios.post(`${url}/register`, {
                name: form.name,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword
            });
            navigate('/login');
        } catch (error: any) {
            if(error.response) {
                console.log(error.response.data.msg);
                setPesan(error.response.data.msg);
            }
        }
    }

    return (
        <section className="vh-100 bg-image" style={{backgroundImage: `url("https://www.nasa.gov/sites/default/files/thumbnails/image/main_image_star-forming_region_carina_nircam_final-5mb.jpg")`, backgroundPosition: "center", backgroundSize: "cover"}}>
            <div className="mask d-flex align-items-center h-100 gradient-custom-3">
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-9 col-lg-7 col-xl-6">
                            <div className="card" style={{borderRadius: "15px;"}}>
                                <div className="card-body p-5">
                                    <h2 className="text-uppercase text-center mb-5">Create an account</h2>
                                    <div className="form-outline mb-4">
                                        <input type="text" id="form3Example1cg" className="form-control form-control-lg" onChange={(e) => setForm({...form, name: e.target.value})} />
                                        <label className="form-label">Your Name</label>
                                    </div>

                                    <div className="form-outline mb-4">
                                        <input type="email" id="form3Example3cg" className="form-control form-control-lg" onChange={(e) => setForm({...form, email: e.target.value})} />
                                        <label className="form-label">Your Email</label>
                                    </div>

                                    <div className="form-outline mb-4">
                                        <input type="password" id="form3Example4cg" className="form-control form-control-lg" onChange={(e) => setForm({...form, password: e.target.value})} />
                                        <label className="form-label">Password</label>
                                    </div>

                                    <div className="form-outline mb-4">
                                        <input type="password" id="form3Example4cdg" className="form-control form-control-lg" onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
                                        <label className="form-label">Repeat your
                                            password</label>
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <input type="submit" className="btn btn-success btn-block" value="Register" onClick={() => Register()} />
                                    </div>

                                    <br />
                                    <h4 style={{color: 'red'}}>{pesan}</h4>
                                    <p className="text-center text-muted mt-5 mb-0">Have already an account? 
                                        <a href="./" className="fw-bold text-body"><u>Login here</u></a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Register;