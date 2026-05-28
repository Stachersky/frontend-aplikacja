import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom"
import Login from "./Login"
import PanelInstruktora from "./PanelInstruktora"
import PanelKlienta from "./PanelKlienta"
import Register from "./Register"

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Navigate to='/login' />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/instruktor' element={<PanelInstruktora />} />
				<Route path='/klient' element={<PanelKlienta />} />
			</Routes>
		</Router>
	)
}

export default App
