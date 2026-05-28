import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function PanelKlienta() {
	const [plany, setPlany] = useState([])
	const [komunikat, setKomunikat] = useState("")
	const [widok, setWidok] = useState("moje") // 'moje' lub 'sklep'
	const navigate = useNavigate()
	const userId = localStorage.getItem("userId")

	useEffect(() => {
		if (!userId) {
			navigate("/login")
			return
		}

		const fetchPlany = async () => {
			try {
				setKomunikat("⏳ Ładowanie...")
				const response = await axios.get(
					`http://localhost:5158/api/Workouts/plans/${userId}`,
				)
				setPlany(response.data)
				setKomunikat("")
			} catch (error) {
				if (error.response && error.response.status === 404) {
					setKomunikat(
						'Nie masz jeszcze aktywnych planów. Przejdź do zakładki "Sklep", aby coś wybrać!',
					)
				} else {
					setKomunikat("❌ Błąd połączenia z serwerem planów.")
				}
			}
		}

		if (widok === "moje") {
			fetchPlany()
		}
	}, [widok, userId, navigate])

	const handleLogout = () => {
		localStorage.clear()
		navigate("/login")
	}

	const kupKarnet = async nazwa => {
		try {
			setKomunikat(`⏳ Łączenie z operatorem płatności... Kupujesz: ${nazwa}`)

			// Wysyłamy prośbę do Javy. Przekazujemy ID klienta w linku, a nazwę karnetu w ciele zapytania.
			const response = await axios.post(
				`http://localhost:8080/api/karnety/kup/${userId}`,
				nazwa,
				{
					headers: { "Content-Type": "text/plain" },
				},
			)

			// Wyświetlamy zielony komunikat o sukcesie zwrócony przez Javę
			setKomunikat("✅ Sukces! " + response.data)
		} catch (error) {
			console.error("Błąd zakupu:", error)
			setKomunikat(
				"❌ Błąd podczas transakcji. Sprawdź, czy serwer Javy jest włączony.",
			)
		}
	}

	const kupPlan = async cel => {
		try {
			setKomunikat(
				`⏳ Trwa generowanie Twojego spersonalizowanego planu: ${cel}...`,
			)

			// Wykorzystujemy nasz gotowy most! React uderza do Javy, a Java do C#.
			const response = await axios.post(
				`http://localhost:8080/api/members/${userId}/training-plan`,
				{
					cel: cel,
					poziom: "Początkujący", // Ustawiamy domyślny poziom dla zakupów ze sklepu
				},
			)

			setKomunikat("✅ Sukces! Plan został przypisany do Twojego profilu.")

			// Automatycznie przełączamy klienta z powrotem do zakładki "Moje",
			// żeby od razu zobaczył swój nowy zakup!
			setWidok("moje")
		} catch (error) {
			console.error("Błąd zakupu planu:", error)
			setKomunikat(
				"❌ Wystąpił błąd. Sprawdź, czy serwery Java i C# są włączone.",
			)
		}
	}

	return (
		<div
			style={{
				textAlign: "center",
				marginTop: "30px",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					padding: "0 20px",
				}}
			>
				<h2 style={{ color: "#2980b9" }}>Witaj w Panelu Klienta! 🏃‍♂️</h2>
				<button
					onClick={handleLogout}
					style={{
						padding: "8px 15px",
						backgroundColor: "#e74c3c",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						height: "40px",
					}}
				>
					Wyloguj się
				</button>
			</div>

			{/* PRZYCISKI ZAKŁADEK */}
			<div style={{ margin: "20px 0" }}>
				<button
					onClick={() => setWidok("moje")}
					style={{
						padding: "10px 20px",
						marginRight: "10px",
						backgroundColor: widok === "moje" ? "#2980b9" : "#bdc3c7",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Moje Plany i Karnety
				</button>
				<button
					onClick={() => setWidok("sklep")}
					style={{
						padding: "10px 20px",
						backgroundColor: widok === "sklep" ? "#27ae60" : "#bdc3c7",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					🛒 Sklep (Kup Karnet / Plan)
				</button>
			</div>

			<hr style={{ width: "80%", borderColor: "#ecf0f1" }} />

			{/* WIDOK: MOJE PLANY */}
			{widok === "moje" && (
				<div>
					<h3 style={{ color: "#e74c3c" }}>{komunikat}</h3>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{plany.map(plan => (
							<div
								key={plan.id}
								style={{
									border: "2px solid #2980b9",
									borderRadius: "8px",
									padding: "20px",
									margin: "10px",
									width: "400px",
									backgroundColor: "#f4f9fd",
									textAlign: "left",
								}}
							>
								<h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
									{plan.nazwa}
								</h3>
								<p style={{ margin: "5px 0" }}>
									<strong>Opis: </strong>
									{plan.opis}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* WIDOK: SKLEP */}
			{widok === "sklep" && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						gap: "30px",
						marginTop: "20px",
						flexWrap: "wrap",
					}}
				>
					{/* OFERTA KARNETÓW */}
					<div
						style={{
							border: "1px solid #ccc",
							padding: "20px",
							borderRadius: "8px",
							width: "300px",
							backgroundColor: "#fff",
						}}
					>
						<h3 style={{ color: "#8e44ad" }}>Karnet Open (Miesiąc)</h3>
						<p>Nielimitowany dostęp do siłowni 24/7.</p>
						<h2>99 PLN</h2>
						<button
							onClick={() => kupKarnet("Karnet Open")}
							style={{
								width: "100%",
								padding: "10px",
								backgroundColor: "#8e44ad",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
							}}
						>
							Kupuję Karnet
						</button>
					</div>

					{/* OFERTA PLANÓW TRENINGOWYCH */}
					<div
						style={{
							border: "1px solid #ccc",
							padding: "20px",
							borderRadius: "8px",
							width: "300px",
							backgroundColor: "#fff",
						}}
					>
						<h3 style={{ color: "#d35400" }}>Plan: Szybkie Odchudzanie</h3>
						<p>Spersonalizowany plan generowany przez nasz system.</p>
						<h2>49 PLN</h2>
						<button
							onClick={() => kupPlan("Odchudzanie")}
							style={{
								width: "100%",
								padding: "10px",
								backgroundColor: "#d35400",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
							}}
						>
							Kupuję Plan
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default PanelKlienta
