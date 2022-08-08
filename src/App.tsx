import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  	return (
	<BrowserRouter>
		<Routes>
			<Route path='/login' element={<Login/>} />
			<Route path='/register' element={<Register/>} />
			<Route path='/bendahara/:id' element={<><Navbar/> <Dashboard/></>}/>
			<Route path='*' element={<Navigate to="/login" replace />} />
		</Routes>
	</BrowserRouter>
  	);
}

export default App;
