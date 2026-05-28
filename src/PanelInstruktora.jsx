import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function PanelInstruktora() {
	// Stany do przechwytywania danych z formularza
	const [klientId, setKlientId] = useState("")
	const [cel, setCel] = useState("Odchudzanie")
	const [poziom, setPoziom] = useState("Początkujący")
	const [komunikat, setKomunikat] = useState("")

	const handleStworzPlan = async e => {
		e.preventDefault()
		setKomunikat("⏳ Generowanie planu w C# (trwa komunikacja mikrousług)...")

		const navigate = useNavigate()

		const handleLogout = () => {
			localStorage.clear() // Czyścimy pamięć (ID użytkownika i jego rolę)
			navigate("/login") // Wracamy na stronę logowania
		}

		try {
			// Tu React dzwoni do Javy, a Java dzwoni do C#!
			const response = await axios.post(
				`http://localhost:8080/api/members/${klientId}/training-plan`,
				{
					cel: cel,
					poziom: poziom,
				},
			)

			setKomunikat(
				"✅ Sukces! Plan został wygenerowany i przypisany do klienta.",
			)
			console.log("Odpowiedź z serwera:", response.data)
		} catch (error) {
			console.error("Błąd tworzenia planu:", error)
			setKomunikat("❌ Wystąpił błąd. Sprawdź, czy Java i C# są włączone!")
		}
	}

	return (
		<div
			style={{
				textAlign: "center",
				marginTop: "40px",
				fontFamily: "sans-serif",
			}}
		>
			<h1 style={{ color: "#d35400" }}>Witaj w Panelu Instruktora! 🏋️‍♀️</h1>
			<p>Kreator planów treningowych</p>

			<button
				onClick={handleLogout}
				style={{
					padding: "8px 15px",
					backgroundColor: "#e74c3c",
					color: "white",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
					marginBottom: "20px",
				}}
			>
				Wyloguj się
			</button>

			<div
				style={{
					border: "1px solid #ccc",
					padding: "20px",
					width: "350px",
					margin: "0 auto",
					borderRadius: "8px",
					backgroundColor: "#f9f9f9",
				}}
			>
				<form onSubmit={handleStworzPlan}>
					<div style={{ marginBottom: "15px" }}>
						<label>ID Klienta: </label>
						<br />
						<input
							type='number'
							value={klientId}
							onChange={e => setKlientId(e.target.value)}
							required
							style={{ padding: "5px", width: "90%" }}
							placeholder='np. 2'
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<label>Cel treningowy: </label>
						<br />
						<select
							value={cel}
							onChange={e => setCel(e.target.value)}
							style={{ padding: "5px", width: "95%" }}
						>
							<option value='Odchudzanie'>
								Odchudzanie (Spalanie tkanki tłuszczowej)
							</option>
							<option value='Budowa Masy'>Budowa Masy Mięśniowej</option>
							<option value='Siła'>Wzrost Siły</option>
							<option value='Kondycja'>Poprawa Kondycji</option>
						</select>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<label>Poziom zaawansowania: </label>
						<br />
						<select
							value={poziom}
							onChange={e => setPoziom(e.target.value)}
							style={{ padding: "5px", width: "95%" }}
						>
							<option value='Początkujący'>Początkujący</option>
							<option value='Średniozaawansowany'>Średniozaawansowany</option>
							<option value='Zaawansowany'>Zaawansowany</option>
						</select>
					</div>

					<button
						type='submit'
						style={{
							padding: "10px 20px",
							cursor: "pointer",
							backgroundColor: "#d35400",
							color: "white",
							border: "none",
							borderRadius: "5px",
							fontWeight: "bold",
						}}
					>
						Wygeneruj Plan
					</button>
				</form>
			</div>

			<h3 style={{ marginTop: "20px" }}>{komunikat}</h3>
		</div>
	)
}

export default PanelInstruktora
