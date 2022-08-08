import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

type ModalData ={
    TambahinNama: boolean,
    TambahinMingguan: boolean,
    BeliBarang: boolean,
    HapusinNama: boolean,
    HapusinMingguan: boolean,
    HapusinBarang: boolean,
    BayarMingguan: boolean,
    UbahBayaran: boolean,
    CetakTable: boolean
}

function Dashboard() {
    const [DataAkun, setDataAkun] = useState<{id: string, name: string}>();
    const [token, setToken] = useState('');
    const [expired, setExpired] = useState(0);
    const [modalShow, setModalShow] = useState<ModalData>({
        TambahinNama: false,
        TambahinMingguan: false,
        BeliBarang: false,
        HapusinNama: false,
        HapusinMingguan: false,
        HapusinBarang: false,
        BayarMingguan: false,
        UbahBayaran: false,
        CetakTable: false
    });
    const [Error, setError] = useState('');
    //List Modal
    const [TambahinNama, setTambahinNama] = useState('');
    const [TambahinMingguan, setTambahinMingguan] = useState('');
    const [HapusinNama, setHapusinNama] = useState('');
    const [HapusinMingguan, setHapusinMingguan] = useState('');
    const [HapusinBarang, setHapusinBarang] = useState('');
    const [BayaranMingguan, setBayaranMingguan] = useState<{id_mingguan: string, id_name: string, bayaran: string}>({
        id_mingguan: "",
        id_name: "",
        bayaran: ""
    })
    const [UbahBayaranData, setUbahBayaranData] = useState<{id_name: string, id_mingguan: string, bayaran: string}>({
        id_name: "",
        id_mingguan: "",
        bayaran: ""
    });
    const [BeliBarang, setBeliBarang] = useState<{name: string, harga: string}>({
        name: "",
        harga: ""
    });
    const [ListNama, setListNama] = useState<{name: string, id: string}[]>();
    const [ListMingguan, setListMingguan] = useState<[{tanggal: string, id: string}]>();
    const [ListBayaran, setListBayaran] = useState<{[idbayaran: string]: string}>({});
    const [ListBarang, setListBarang] = useState<[{name: string, harga: string, id: string}]>();
    const [Total, setTotal] = useState<{[idbayaran: string]: number}>({});

    const { id } = useParams();

    const Bulan = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        refreshToken();
        DapatinListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(async(config) => {
        const currentDate = new Date();
        if(expired * 1000 < currentDate.getTime()) {
            const response = await axios.get('https://bendahara-v2-api.herokuapp.com/token');
            const decoded: {UserId: string, email: string, name: string, exp: number, iat: number} = jwt_decode(response.data.accessToken);
            
            config.headers!.Authorization = `Bearer ${response.data.accessToken}`;
            setToken(response.data.accessToken);
            setDataAkun({id: decoded.UserId, name: decoded.name});
            setExpired(decoded.exp);
        }

        return config;
    }, (err) => {
        console.log("Ada error")
        return Promise.reject(err);
    });

    const SimpanDataBendahara = async (modal: ModalData, status: string, data: {}) => {
        console.log(data);
        for(const i of Object.values(data)) {
            if(i === "") {
                alert("Tolong masukin data.");
                return;
            }
        }

        setModalShow(modal);
        //Tidak tau kenapa dikasi await sebelum axiosJWT akan stop functionnya, jadi ya harus diremove 04/08/2022 11:00PM
        axiosJWT.post(`https://bendahara-v2-api.herokuapp.com/UpdateData`, {
            id,
            status,
            ...data
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        await DapatinListData();
    }

    const DapatinListData = async() => {
        try {
            const Data = await axios.get(`https://bendahara-v2-api.herokuapp.com/DapatinData?id=${id}`);
            console.log(Data.data)
            
            Data.data.nama.sort((a: {name: string}, b: {name: string}) => {
                return a.name.localeCompare(b.name);
            });

            Data.data.mingguan.sort((a: {tanggal: string}, b: {tanggal: string}) => {
                return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
            });
            
            const DataBayaran: {bayaran: string, id_mingguan: string, id_name: string, id: string}[] = Data.data.bayaran;
            const listBayaran: {[idbayaran: string]: string} = {};
            const totalObject: {[idminggu: string]: number} = {}
            for(const d of DataBayaran) {
                const key = d.id_name + " " + d.id_mingguan;
                if(isNaN(totalObject[d.id_mingguan as keyof typeof totalObject]))
                    totalObject[d.id_mingguan as keyof typeof totalObject] = 0;
                totalObject[d.id_mingguan as keyof typeof totalObject] += parseInt(d.bayaran);
                listBayaran[key as keyof typeof listBayaran] = d.bayaran;
            }
            console.log(listBayaran);
            console.log(totalObject);

            setListNama(Data.data.nama);
            setListMingguan(Data.data.mingguan);
            setListBayaran(listBayaran);
            setListBarang(Data.data.barang);
            setTotal(totalObject);
        } catch(err) {
            setError('error');
        }
    }

    const refreshToken = async() => {
        try {
            const response = await axios.get('https://bendahara-v2-api.herokuapp.com/token');
            setToken(response.data.accessToken);
        
            const decoded: {UserId: string, email: string, name: string, exp: number, iat: number} = jwt_decode(response.data.accessToken);
            setDataAkun({id: decoded.UserId, name: decoded.name});
            setExpired(decoded.exp);
        } catch (error: any) {
            console.error("Belum login");
            // navigate('/login');
        }
    }

    const CetakFunction = (input: string) => {
        const tanggal = `${new Date(input.split('_')[1]).getDate()} ${Bulan[new Date(input.split('_')[1]).getMonth()]}, Minggu ${parseInt(input.split('_')[2])+1}`
        let CetakBayaran: string = `${tanggal}\n\n`;
        // const CetakBayaran: {[nama: string]: string} = {};
        if(ListNama !== undefined) {
            for(const d of ListNama) {
                CetakBayaran += `${d.name}: ${ListBayaran[d.id + " " + input.split('_')[0]] === undefined ? "0000" : ListBayaran[d.id + " " + input.split('_')[0]]}\n`
                // CetakBayaran[d.name] = ListBayaran[d.id + " " + input] === undefined ? "0000" : ListBayaran[d.id + " " + input];
            }
        }

        (document.getElementById("CetakTable_textarea") as HTMLTextAreaElement).value = CetakBayaran;
    }

    return (
    <div className="container-fluid">
        <div className="row">
            <main className="col-md-9 ms-sm-auto col-lg-12 px-md-4">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    {Error === "error" ? (
                        <h3 style={{color: "red"}}>Bendahara tidak ditemukan!</h3>
                    ) : ( DataAkun?.name !== undefined &&
                        <h3>Selamat datang, {DataAkun?.name}!</h3>
                    )
                    }
                    <div className="btn-toolbar mb-2 mb-md-0">
                        <div className="btn-group me-2">
                            <button type="button" className="btn btn-sm btn-outline-secondary" style={{visibility: "hidden"}}>Share</button>
                            <button type="button" className="btn btn-sm btn-outline-secondary" style={{visibility: "hidden"}}>Export</button>
                        </div>
                    </div>
                </div>
    
                <h2>Uang kas</h2>
                <div className="table-responsive">
                    <table id="table_bendahara" className="table table-sm table-hover">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">Nomor</th>
                                <th scope="col">Nama</th>
                                {ListMingguan === undefined || ListMingguan.length <= 0 ? (
                                    <th scope='col'>Minggu</th>
                                ) : ListMingguan?.map((v, i) => {
                                    return(<th scope="col">{new Date(v.tanggal).getDate()} {Bulan[new Date(v.tanggal).getMonth()]}, Minggu {i+1}</th>)
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {ListNama?.map((v, index) => {
                                return (
                                    <tr>
                                        <th scope='row'>{index+1}</th>
                                        <td>{v.name}</td>
                                        {ListMingguan!.length <= 0 ? (
                                            <td id="minggu">0000</td>
                                        ) : ListMingguan!.map((m) => {
                                            if(ListBayaran[v.id + ' ' + m.id] === undefined) {
                                                return (<td>0000</td>)
                                            }
                                            return (<td>{ListBayaran[v.id+' '+m.id]}</td>)
                                        })
                                        }
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>#</td>
                                <td>Total: </td>
                                {ListMingguan === undefined || ListMingguan.length <= 0 ? (
                                    <th scope='row'>0000</th>
                                ) : ListMingguan?.map((v, i) => {
                                    if(Total[v.id] === undefined) return(<th scope="row">0000</th>)
                                    return(<th scope="row">{Total[v.id]}</th>)
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <h3>Barang Dibeli</h3>
                <br />
                <div className="table-responsive-sm">
                    <table id="table_belian" className="table table-bordered">
                        <caption>Barang dibeli dengan uang kas</caption>
                        <thead>
                            <tr>
                                <th scope="col">Nomor</th>
                                <th scope="col">Barang</th>
                                <th scope="col">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ListBarang !== undefined && ListBarang.map((v, i) => {
                                return (
                                <tr>
                                    <th scope="row">{i+1}</th>
                                    <td>{v.name}</td>
                                    <td>{v.harga}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <h3>Total hasil uang kas: <span style={{color: Object.values(Total).reduce((a, b) => a + b, 0) - (ListBarang === undefined ? 0 : ListBarang.reduce((a, b) => a + parseInt(b.harga), 0)) > 0 ? "green" : "red"}}>{Object.values(Total).reduce((a, b) => a + b, 0) - (ListBarang === undefined ? 0 : ListBarang.reduce((a, b) => a + parseInt(b.harga), 0))}</span></h3>
                
                <br />
                { id === DataAkun?.id &&
                <>
                <button className="btn btn-primary" onClick={() => setModalShow({...modalShow, TambahinNama: true})} style={{marginRight: "10px"}}>Tambahin nama</button>
                <button className="btn btn-primary" onClick={() => setModalShow({...modalShow, TambahinMingguan: true})} style={{marginRight: "10px"}}>Tambahin mingguan</button>
                <button className="btn btn-primary" onClick={() => setModalShow({...modalShow, BeliBarang: true})} style={{marginRight: "10px"}}>Beli barang</button>
                <br />
                <br />
                <button className="btn btn-danger" onClick={() => setModalShow({...modalShow, HapusinNama: true})} style={{marginRight: "10px"}}>Hapusin Nama</button>
                <button className="btn btn-danger" onClick={() => setModalShow({...modalShow, HapusinMingguan: true})} style={{marginRight: "10px"}}>Hapusin Mingguan</button>
                <button className="btn btn-danger" onClick={() => setModalShow({...modalShow, HapusinBarang: true})} style={{marginRight: "10px"}}>Hapus Barang</button>
                <br />
                <br />
                <button className="btn btn-success" onClick={() => setModalShow({...modalShow, BayarMingguan: true})} style={{marginRight: "10px"}}>Bayar mingguan</button>
                <button className="btn btn-success" onClick={() => setModalShow({...modalShow, UbahBayaran: true})} style={{marginRight: "10px"}}>Ubah Bayaran</button>
                <br />
                <br />
                <button className="btn btn-warning" onClick={() => setModalShow({...modalShow, CetakTable: true})} style={{marginRight: "10px"}}>Cetak</button>
                </>
                }
                <br />
                
                <div className="comments" style={{marginTop: "20px"}}>
                    <form action="">
                        <div className="input-group mb-3">
                            <input type="hidden" name="waktu" id="waktu_komentar" />
                            <input type="text" className="form-control" placeholder="Komentar" name="komentar" />
                            <button className="btn btn-success" type="submit" id="button-addon2">Kirim</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>

        <Modal show={modalShow.TambahinNama} onHide={() => setModalShow({...modalShow, TambahinNama: false})}>
            <Modal.Header>
                <Modal.Title>Tambahin Nama</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, TambahinNama: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <label className="text-center w-100"> Nama Lengkap </label>
                <input type="text" className="form-control" placeholder="Nama Lengkap" maxLength={40} defaultValue={TambahinNama} onChange={(e) => setTambahinNama(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, TambahinNama: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, TambahinNama: false}, "TambahinNama", {name: TambahinNama})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.TambahinMingguan} onHide={() => setModalShow({...modalShow, TambahinMingguan: false})}>
            <Modal.Header>
                <Modal.Title>Tambahin Nama</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, TambahinMingguan: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <label className="text-center w-100"> Minggu berapa </label>
                <input type="date" id="utanggal_buat" name="tanggal" className="form-control" defaultValue={TambahinMingguan} onChange={(e) => setTambahinMingguan(e.target.value)} required />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, TambahinMingguan: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, TambahinMingguan: false}, "TambahinMingguan", {tanggal: TambahinMingguan})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.BeliBarang} onHide={() => setModalShow({...modalShow, BeliBarang: false})}>
            <Modal.Header>
                <Modal.Title>Beli Barang</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, BeliBarang: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-md-12 mb-2">
                            <label className="text-center w-100"> Nama barang </label>
                            <input type="text" className="form-control" placeholder="Nama Barang" maxLength={20} autoComplete="off" onChange={(e) => setBeliBarang({...BeliBarang, name: e.target.value})} />
                            <br />
                            <label className="text-center w-100"> Harga </label>
                            <input type="number" className="form-control" placeholder="1000 Rp" onChange={(e) => setBeliBarang({...BeliBarang, harga: e.target.value})} />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, BeliBarang: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, BeliBarang: false}, "BeliBarang", {name: BeliBarang.name, harga: BeliBarang.harga})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.HapusinNama} onHide={() => setModalShow({...modalShow, HapusinNama: false})}>
            <Modal.Header>
                <Modal.Title>Hapusin Nama</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, HapusinNama: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <label className="text-center w-100"> Nama Lengkap </label>
                <select className="form-select" onChange={(e) => setHapusinNama(e.target.value)}>
                    <option value="" selected disabled hidden>Pilih Nama</option>
                    {ListNama?.map((v) => {
                        return(<option value={v.id}>{v.name}</option>)
                    })}
                </select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, HapusinNama: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, HapusinNama: false}, "HapusinNama", {id_name: HapusinNama})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.HapusinMingguan} onHide={() => setModalShow({...modalShow, HapusinMingguan: false})}>
            <Modal.Header>
                <Modal.Title>Hapusin Mingguan</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, HapusinMingguan: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <label className="text-center w-100"> Nama Lengkap </label>
                <select className="form-select" onChange={(e) => setHapusinMingguan(e.target.value)}>
                    <option value="" selected disabled hidden>Pilih Mingguan</option>
                    {ListMingguan?.map((v, i) => {
                        return(<option value={v.id}>{new Date(v.tanggal).getDate()} {Bulan[new Date(v.tanggal).getMonth()]}, Minggu {i+1}</option>)
                    })}
                </select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, HapusinMingguan: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, HapusinMingguan: false}, "HapusinMingguan", {id_mingguan: HapusinMingguan})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.HapusinBarang} onHide={() => setModalShow({...modalShow, HapusinBarang: false})}>
            <Modal.Header>
                <Modal.Title>Beli Barang</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, HapusinBarang: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                <div className="col-lg-12">
                    <div className="row">
                        <div className="col-md-12 mb-2">
                            <select className='form-control' onChange={(e) => setHapusinBarang(e.target.value)}>
                                <option value="" selected disabled hidden>Pilih Barang</option>
                                {ListBarang?.map((v, i) => {
                                    return(<option value={v.id}>{v.name}</option>)
                                })}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, HapusinBarang: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, HapusinBarang: false}, "HapusinBarang", {id_barang: HapusinBarang})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.BayarMingguan} onHide={() => setModalShow({...modalShow, BayarMingguan: false})}>
            <Modal.Header>
                <Modal.Title>Bayar Mingguan</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, BayarMingguan: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                Nama: 
                <select className="form-select" onChange={(e) => setBayaranMingguan({...BayaranMingguan, id_name: e.target.value})}>
                    <option value="" selected disabled hidden>Pilih Nama</option>
                    {ListNama?.map((v) => {
                        return(<option value={v.id}>{v.name}</option>)
                    })}
                </select>
                <br />
                Minggu:
                <select className="form-select" onChange={(e) => setBayaranMingguan({...BayaranMingguan, id_mingguan: e.target.value})}>
                    <option value="" selected disabled hidden>Pilih Mingguan</option>
                    {ListMingguan?.map((v, i) => {
                        return(<option value={v.id}>{new Date(v.tanggal).getDate()} {Bulan[new Date(v.tanggal).getMonth()]}, Minggu {i+1}</option>)
                    })}
                </select>
                <br />
                Jumlah:
                <input type="number" className="form-select" placeholder="1000 Rp" onChange={(e) => setBayaranMingguan({...BayaranMingguan, bayaran: e.target.value})} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, BayarMingguan: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, BayarMingguan: false}, "BayarMingguan", {id_mingguan: BayaranMingguan.id_mingguan, id_name: BayaranMingguan.id_name, bayaran: BayaranMingguan.bayaran})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.UbahBayaran} onHide={() => setModalShow({...modalShow, UbahBayaran: false})}>
            <Modal.Header>
                <Modal.Title>Ubah Bayaran</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, UbahBayaran: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
                Nama: 
                <select className="form-select" onChange={(e) => {
                    setUbahBayaranData({...UbahBayaranData, id_name: e.target.value});
                    (document.getElementById('ubah_mingguan') as HTMLSelectElement)!.disabled = false;
                    (document.getElementById('inputubahbayaran') as HTMLInputElement)!.defaultValue = ListBayaran[e.target.value + " " + UbahBayaranData.id_mingguan] === undefined ? "0000" : ListBayaran[e.target.value + " " + UbahBayaranData.id_mingguan];
                }}>
                    <option value="" selected disabled hidden>Pilih Nama</option>
                    {ListNama?.map((v) => {
                        return(<option value={v.id}>{v.name}</option>)
                    })}
                </select>
                <br />
                Minggu:
                <select className="form-select" id="ubah_mingguan" onChange={(e) => {
                    const Text = ListBayaran[UbahBayaranData.id_name + " " + e.target.value] === undefined ? "0000" : ListBayaran[UbahBayaranData.id_name + " " + e.target.value];
                    (document.getElementById('inputubahbayaran') as HTMLInputElement)!.disabled = false;
                    (document.getElementById('inputubahbayaran') as HTMLInputElement)!.defaultValue = Text;
                    setUbahBayaranData({...UbahBayaranData, id_mingguan: e.target.value, bayaran: Text});
                }} disabled>
                    <option value="" selected disabled hidden>Pilih Mingguan</option>
                    {ListMingguan?.map((v, i) => {
                        return(<option value={v.id}>{new Date(v.tanggal).getDate()} {Bulan[new Date(v.tanggal).getMonth()]}, Minggu {i+1}</option>)
                    })}
                </select>
                <br />
                Jumlah:
                <input type="number" id="inputubahbayaran" className="form-select" placeholder="1000 Rp" onChange={(e) => setUbahBayaranData({...UbahBayaranData, bayaran: e.target.value})} disabled />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow({...modalShow, UbahBayaran: false})}>Tutup</Button>
                <Button variant='primary' onClick={() => SimpanDataBendahara({...modalShow, UbahBayaran: false}, "UbahBayaran", {id_name: UbahBayaranData.id_name, id_mingguan: UbahBayaranData.id_mingguan, bayaran: UbahBayaranData.bayaran})}>Simpan</Button>
            </Modal.Footer>
        </Modal>

        <Modal show={modalShow.CetakTable} onHide={() => setModalShow({...modalShow, CetakTable: false})}>
            <Modal.Header>
                <Modal.Title>Cetak</Modal.Title>
                <button className='btn-close' onClick={() => setModalShow({...modalShow, CetakTable: false})}>X</button>
            </Modal.Header>
            <Modal.Body>
            <div className="col-lg-12">
                <div className="row">
                    <div className="col-md-12 mb-2">
                        Minggu :
                        <select className="form-select" onChange={(e) => CetakFunction(e.target.value)}>
                            <option value="" selected disabled hidden>Pilih Mingguan</option>
                            {ListMingguan?.map((v, i) => {
                                return(<option value={v.id + "_" + v.tanggal + "_" + i.toString()}>{new Date(v.tanggal).getDate()} {Bulan[new Date(v.tanggal).getMonth()]}, Minggu {i+1}</option>)
                            })}
                        </select>
                        <br />
                        <textarea className="form-control" placeholder="Leave a comment here" id="CetakTable_textarea" style={{height: "100px", resize: "none"}} readOnly={true}></textarea>
                    </div>
                </div>
            </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={() => {setModalShow({...modalShow, CetakTable: false}); navigator.clipboard.writeText((document.getElementById("CetakTable_textarea") as HTMLTextAreaElement).value)}}>Cetak</Button>
            </Modal.Footer>
        </Modal>
    </div>
    )
}

export default Dashboard