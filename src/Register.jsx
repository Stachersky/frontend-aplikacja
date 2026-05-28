import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

function Register() {
	const [imie, setImie] = useState("")
	const [nazwisko, setNazwisko] = useState("")
	const [email, setEmail] = useState("")
	const [haslo, setHaslo] = useState("")
	const [komunikat, setKomunikat] = useState("")

	const navigate = useNavigate()

	const handleRegister = async e => {
		e.preventDefault()

		try {
			const response = await axios.post(
				"http://localhost:8080/api/auth/register",
				{
					imie: imie,
					nazwisko: nazwisko,
					email: email,
					haslo: haslo,
				},
			)

			setKomunikat("✅ " + response.data) // Wyświetli komunikat z Javy

			// Po 2 sekundach od sukcesu automatycznie przerzucamy na stronę logowania
			setTimeout(() => {
				navigate("/login")
			}, 2000)
		} catch (error) {
			console.error("Błąd rejestracji:", error)
			setKomunikat("❌ Rejestracja nie powiodła się. Sprawdź, czy Java działa.")
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
			<h2 style={{ color: "#2ecc71" }}>Zostań nowym klientem siłowni!</h2>
			<form onSubmit={handleRegister}>
				<div style={{ margin: "10px" }}>
					<input
						type='text'
						placeholder='Imię'
						value={imie}
						onChange={e => setImie(e.target.value)}
						required
						style={{ padding: "8px", width: "200px" }}
					/>
				</div>
				<div style={{ margin: "10px" }}>
					<input
						type='text'
						placeholder='Nazwisko'
						value={nazwisko}
						onChange={e => setNazwisko(e.target.value)}
						required
						style={{ padding: "8px", width: "200px" }}
					/>
				</div>
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
					style={{
						padding: "10px 20px",
						cursor: "pointer",
						backgroundColor: "#2ecc71",
						color: "white",
						border: "none",
						borderRadius: "5px",
						fontWeight: "bold",
					}}
				>
					Zarejestruj się
				</button>
			</form>

			<h3 style={{ marginTop: "20px" }}>{komunikat}</h3>

			<div style={{ marginTop: "30px" }}>
				<p>
					Masz już konto?{" "}
					<Link to='/login' style={{ color: "#3498db" }}>
						Zaloguj się tutaj
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Register
