import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import QRCode from "react-qr-code"

function PanelKlienta() {
	const [plany, setPlany] = useState([])
	const [komunikat, setKomunikat] = useState("")

	// NOWE STANY DO FORMULARZA WYNIKÓW
	const [sessionId, setSessionId] = useState("")
	const [czas, setCzas] = useState("")
	const [kcal, setKcal] = useState("")

	// STANY DO KALKULATORA 1RM
	const [ciezar, setCiezar] = useState("")
	const [powtorzenia, setPowtorzenia] = useState("")
	const [wynik1RM, setWynik1RM] = useState(null)

	const navigate = useNavigate()
	const userId = localStorage.getItem("userId")
	const isKarnetAktywny = localStorage.getItem("maAktywnyKarnet") === "true"
	const [widok, setWidok] = useState(isKarnetAktywny ? "moje" : "sklep")
	const [zajeciaList, setZajeciaList] = useState([])

	const [czyWszedlNaSilownie, setCzyWszedlNaSilownie] = useState(false)
	useEffect(() => {
		if (!userId) {
			navigate("/login")
			return
		}

		if (widok === "grafik") {
			const fetchZajecia = async () => {
				try {
					const response = await axios.get(
						"http://localhost:8080/api/zajecia/grafik",
					)
					setZajeciaList(response.data)
				} catch (error) {
					setKomunikat("❌ Nie udało się pobrać grafiku zajęć.")
				}
			}
			fetchZajecia()
		}

		if (widok === "moje" && isKarnetAktywny) {
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
			fetchPlany()
		}

		const rezerwujZajecia = async idZajec => {
			try {
				const response = await axios.post(
					`http://localhost:8080/api/zajecia/${idZajec}/rezerwuj?uzytkownikId=${userId}`,
				)
				setKomunikat(response.data)
			} catch (error) {
				setKomunikat("❌ Błąd rezerwacji.")
			}
		}
	}, [widok, userId, isKarnetAktywny, navigate])

	const handleLogout = () => {
		localStorage.clear()
		navigate("/login")
	}

	const symulujWejscieQR = async () => {
		try {
			setKomunikat("⏳ Skanowanie kodu QR na bramce...")
			const response = await axios.post(
				`http://localhost:8080/api/access/checkin?uzytkownikId=${userId}`,
			)
			setKomunikat("✅ " + response.data)

			// ODBLOKOWUJEMY OKIENKA TRENINGOWE!
			setCzyWszedlNaSilownie(true)
		} catch (error) {
			if (error.response && error.response.data) {
				setKomunikat(
					`❌ Bramka zamknięta: ${error.response.data.message || error.response.data}`,
				)
			} else {
				setKomunikat("❌ Błąd skanera QR. Sprawdź połączenie z serwerem Javy.")
			}
		}
	}

	// NOWA FUNKCJA: WYSYŁANIE WYNIKÓW
	const zakonczTrening = async e => {
		e.preventDefault()
		try {
			setKomunikat("⏳ Trwa analiza Twojego treningu...")

			const response = await axios.post(
				`http://localhost:8080/api/workouts/sessions/${sessionId}/complete`,
				{
					spalonyKcal: parseInt(kcal),
					czasMinuty: parseInt(czas),
				},
			)

			setKomunikat("✅ " + response.data)
			// Czyścimy pola po udanym wysłaniu
			setSessionId("")
			setCzas("")
			setKcal("")
		} catch (error) {
			console.error("Błąd zapisu treningu:", error)
			setKomunikat("❌ Błąd podczas zapisywania wyników.")
		}
	}

	const oblicz1RM = async e => {
		e.preventDefault()
		try {
			// Tu React uderza BEZPOŚREDNIO do C#, pomijając Javę, bo kalkulator jest otwarty i nie wymaga zabezpieczeń ról!
			const response = await axios.get(
				`http://localhost:5158/api/Calculators/1rm?ciezar=${ciezar}&powtorzenia=${powtorzenia}`,
			)
			setWynik1RM(response.data.maxCiezar)
		} catch (error) {
			console.error("Błąd kalkulatora:", error)
		}
	}

	const zapiszRekord = async () => {
		try {
			setKomunikat("⏳ Zapisywanie rekordu...")
			const response = await axios.post(
				"http://localhost:5158/api/Workouts/records",
				{
					uzytkownikId: parseInt(userId),
					cwiczenie: "Złożone (1RM)", // Domyślna nazwa ćwiczenia z kalkulatora
					ciezar: wynik1RM,
				},
			)
			setKomunikat("✅ " + response.data)
		} catch (error) {
			console.error("Błąd zapisu rekordu:", error)
			setKomunikat("❌ Nie udało się zapisać rekordu.")
		}
	}

	const kupKarnet = async nazwa => {
		try {
			setKomunikat(`⏳ Łączenie z operatorem płatności... Kupujesz: ${nazwa}`)
			const response = await axios.post(
				`http://localhost:8080/api/karnety/kup/${userId}`,
				nazwa,
				{ headers: { "Content-Type": "text/plain" } },
			)
			setKomunikat(
				"✅ Sukces! " +
					response.data +
					" Wyloguj się i zaloguj ponownie, aby system odświeżył Twój dostęp!",
			)
		} catch (error) {
			setKomunikat("❌ Błąd podczas transakcji.")
		}
	}

	const kupPlan = async cel => {
		try {
			setKomunikat(
				`⏳ Trwa generowanie Twojego spersonalizowanego planu: ${cel}...`,
			)
			await axios.post(
				`http://localhost:8080/api/members/${userId}/training-plan`,
				{ cel: cel, poziom: "Początkujący" },
			)
			setKomunikat("✅ Sukces! Plan został przypisany do Twojego profilu.")
			if (isKarnetAktywny) setWidok("moje")
		} catch (error) {
			setKomunikat("❌ Wystąpił błąd podczas generowania planu.")
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
					}}
				>
					Wyloguj się
				</button>

				<button
					onClick={() => setWidok("grafik")}
					style={{
						padding: "10px 20px",
						backgroundColor: widok === "grafik" ? "#9b59b6" : "#bdc3c7",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						fontWeight: "bold",
					}}
				>
					📅 Grafik Zajęć
				</button>
			</div>

			{!isKarnetAktywny && (
				<div
					style={{
						backgroundColor: "#fff3cd",
						color: "#856404",
						padding: "15px",
						margin: "20px",
						borderRadius: "8px",
						fontWeight: "bold",
					}}
				>
					⚠️ Nie masz aktywnego karnetu! Twój dostęp jest zablokowany. Kup
					karnet w Sklepie.
				</div>
			)}

			<div style={{ margin: "20px 0" }}>
				<button
					onClick={() => isKarnetAktywny && setWidok("moje")}
					disabled={!isKarnetAktywny}
					style={{
						padding: "10px 20px",
						marginRight: "10px",
						backgroundColor:
							widok === "moje"
								? "#2980b9"
								: isKarnetAktywny
									? "#bdc3c7"
									: "#95a5a6",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: isKarnetAktywny ? "pointer" : "not-allowed",
						opacity: isKarnetAktywny ? 1 : 0.6,
					}}
				>
					{isKarnetAktywny
						? "Moje Plany i Karnety"
						: "🔒 Moje Plany (Zablokowane)"}
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
			<h3 style={{ color: "#e74c3c" }}>{komunikat}</h3>

			{/* WIDOK: MOJE PLANY I BRAMKA */}
			{widok === "moje" && isKarnetAktywny && (
				<div>
					{/* SEKCJA 1: BRAMKA WEJŚCIOWA */}
					<div
						style={{
							marginTop: "20px",
							padding: "20px",
							border: "2px dashed #27ae60",
							borderRadius: "10px",
							display: "inline-block",
							backgroundColor: "#f9fbf9",
							marginRight: "20px",
							verticalAlign: "top",
						}}
					>
						<h3 style={{ color: "#27ae60", margin: "0 0 15px 0" }}>
							Twoja Karta Wstępu
						</h3>
						<div
							style={{
								background: "white",
								padding: "10px",
								display: "inline-block",
								borderRadius: "10px",
							}}
						>
							<QRCode value={userId ? userId.toString() : "0"} size={120} />
						</div>
						<p style={{ fontSize: "12px", color: "#7f8c8d" }}>
							Przyłóż ten kod do skanera na bramce
						</p>
						<button
							onClick={symulujWejscieQR}
							style={{
								marginTop: "10px",
								padding: "10px 20px",
								backgroundColor: "#3498db",
								color: "white",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							📱 Symuluj skaner
						</button>
					</div>

					{czyWszedlNaSilownie && (
						<>
							{/* SEKCJA 2: ZAPISYWANIE WYNIKÓW TRENINGU */}
							<div
								style={{
									marginTop: "20px",
									padding: "20px",
									border: "2px dashed #e67e22",
									borderRadius: "10px",
									display: "inline-block",
									backgroundColor: "#fffaf0",
									verticalAlign: "top",
								}}
							>
								<h3 style={{ color: "#d35400", margin: "0 0 15px 0" }}>
									💪 Zakończ trening
								</h3>
								<form
									onSubmit={zakonczTrening}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "10px",
									}}
								>
									<input
										type='number'
										placeholder='ID Sesji (z komunikatu po wejściu)'
										value={sessionId}
										onChange={e => setSessionId(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<input
										type='number'
										placeholder='Czas w minutach (np. 60)'
										value={czas}
										onChange={e => setCzas(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<input
										type='number'
										placeholder='Spalone kalorie (np. 600)'
										value={kcal}
										onChange={e => setKcal(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<button
										type='submit'
										style={{
											padding: "10px 15px",
											backgroundColor: "#e67e22",
											color: "white",
											border: "none",
											borderRadius: "5px",
											cursor: "pointer",
											fontWeight: "bold",
										}}
									>
										💾 Wyślij do analizy
									</button>
								</form>
							</div>
						</>
					)}
					{czyWszedlNaSilownie && (
						<>
							{/* SEKCJA KALKULATORA 1RM */}
							<div
								style={{
									marginTop: "20px",
									padding: "20px",
									border: "2px dashed #8e44ad",
									borderRadius: "10px",
									display: "inline-block",
									backgroundColor: "#f5eef8",
									verticalAlign: "top",
									marginLeft: "20px",
								}}
							>
								<h3 style={{ color: "#8e44ad", margin: "0 0 15px 0" }}>
									🧮 Kalkulator Siły (1RM)
								</h3>
								<p style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
									Oblicz swój maksymalny ciężar na 1 powtórzenie.
								</p>
								<form
									onSubmit={oblicz1RM}
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "10px",
									}}
								>
									<input
										type='number'
										placeholder='Podniesiony ciężar (kg)'
										value={ciezar}
										onChange={e => setCiezar(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<input
										type='number'
										placeholder='Liczba powtórzeń'
										value={powtorzenia}
										onChange={e => setPowtorzenia(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<button
										type='submit'
										style={{
											padding: "10px 15px",
											backgroundColor: "#8e44ad",
											color: "white",
											border: "none",
											borderRadius: "5px",
											cursor: "pointer",
											fontWeight: "bold",
										}}
									>
										Oblicz
									</button>
								</form>
								{wynik1RM && (
									<div
										style={{
											marginTop: "15px",
											padding: "10px",
											backgroundColor: "white",
											borderRadius: "5px",
											color: "#2c3e50",
											fontWeight: "bold",
										}}
									>
										<p>
											Twój szacowany 1RM to:{" "}
											<span style={{ color: "#e74c3c" }}>{wynik1RM} kg</span> 🏋️‍♂️
										</p>

										<button
											onClick={zapiszRekord}
											style={{
												width: "100%",
												marginTop: "5px",
												padding: "8px 10px",
												backgroundColor: "#f1c40f",
												color: "#2c3e50",
												border: "none",
												borderRadius: "5px",
												cursor: "pointer",
												fontWeight: "bold",
											}}
										>
											⭐ Zapisz to jako Mój Rekord
										</button>
									</div>
								)}
							</div>
						</>
					)}

					{/* SEKCJA 3: LISTA PLANÓW */}
					<h3 style={{ marginTop: "40px", color: "#2c3e50" }}>
						Twoje aktualne plany treningowe:
					</h3>
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

			{widok === "grafik" && (
				<div style={{ marginTop: "20px" }}>
					<h3>Dostępne zajęcia grupowe:</h3>
					{zajeciaList.map(z => (
						<div
							key={z.id}
							style={{
								border: "1px solid #ddd",
								padding: "10px",
								margin: "10px auto",
								width: "300px",
								borderRadius: "5px",
							}}
						>
							<h4>{z.nazwa}</h4>
							<p>Data: {z.dataGodzina.replace("T", " ")}</p>
							<button
								onClick={() => rezerwujZajecia(z.id)}
								style={{
									backgroundColor: "#9b59b6",
									color: "white",
									border: "none",
									padding: "5px 10px",
									borderRadius: "3px",
									cursor: "pointer",
								}}
							>
								Zarezerwuj
							</button>
						</div>
					))}
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
					<div
						style={{
							border: "1px solid #ccc",
							padding: "20px",
							borderRadius: "8px",
							width: "300px",
							backgroundColor: "#fff",
						}}
					>
						<h3 style={{ color: "#8e44ad" }}>Karnet Open</h3>
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
