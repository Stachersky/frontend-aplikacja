import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom" // 1. Importujemy nawigatora

function Login() {
	const [email, setEmail] = useState("")
	const [haslo, setHaslo] = useState("")
	const [komunikat, setKomunikat] = useState("")

	const navigate = useNavigate() // 2. Uruchamiamy nawigatora

	const handleLogin = async e => {
		e.preventDefault()

		try {
			const response = await axios.post(
				"http://localhost:8080/api/auth/login",
				{
					email: email,
					haslo: haslo,
				},
			)

			const uzytkownik = response.data

			// 3. ZAPISUJEMY DANE W PAMIĘCI PRZEGLĄDARKI (Local Storage)
			// Dzięki temu inne strony będą wiedziały kim jesteś i jakie masz ID
			localStorage.setItem("userId", uzytkownik.id)
			localStorage.setItem("userRole", uzytkownik.rola)

			// 4. LOGIKA PRZEKIEROWANIA NA PODSTAWIE ROLI
			if (uzytkownik.rola === "ROLE_INSTRUCTOR") {
				navigate("/instruktor")
			} else {
				navigate("/klient")
			}
		} catch (error) {
			console.error("Pełny błąd:", error)
			if (error.response) {
				setKomunikat(`Odrzucono! Kod błędu: ${error.response.status}`)
			} else {
				setKomunikat("Błąd sieci / Serwer wyłączony!")
			}
		}
	}

	return (
		<div
			style={{
				textAlign: "center",
				marginTop: "50px",
				fontFamily: "sans-serif",
			}}
		>
			<h2>Logowanie do systemu siłowni</h2>
			<form onSubmit={handleLogin}>
				<div style={{ margin: "10px" }}>
					<input
						type='email'
						placeholder='Twój e-mail'
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						style={{ padding: "8px", width: "200px" }}
					/>
				</div>
				<div style={{ margin: "10px" }}>
					<input
						type='password'
						placeholder='Hasło'
						value={haslo}
						onChange={e => setHaslo(e.target.value)}
						required
						style={{ padding: "8px", width: "200px" }}
					/>
				</div>
				<button
					type='submit'
					style={{ padding: "10px 20px", cursor: "pointer" }}
				>
					Zaloguj się
				</button>
			</form>

			<h3 style={{ marginTop: "20px", color: "red" }}>{komunikat}</h3>
			<div style={{ marginTop: "30px" }}>
				<p>
					Nie masz jeszcze konta?{" "}
					<Link to='/register' style={{ color: "#2ecc71", fontWeight: "bold" }}>
						Zarejestruj się
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Login
