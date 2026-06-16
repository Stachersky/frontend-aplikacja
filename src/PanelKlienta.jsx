import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import QRCode from "react-qr-code"

function PanelKlienta() {
	const [plany, setPlany] = useState([])
	const [komunikat, setKomunikat] = useState("")

	const [sessionId, setSessionId] = useState("")
	const [czas, setCzas] = useState("")
	const [kcal, setKcal] = useState("")

	const [ciezar, setCiezar] = useState("")
	const [powtorzenia, setPowtorzenia] = useState("")
	const [wynik1RM, setWynik1RM] = useState(null)

	const navigate = useNavigate()
	const userId = localStorage.getItem("userId")
	const isKarnetAktywny = localStorage.getItem("maAktywnyKarnet") === "true"

	const [widok, setWidok] = useState(isKarnetAktywny ? "moje" : "sklep")

	const [zajeciaList, setZajeciaList] = useState([])
	const [mojeZajecia, setMojeZajecia] = useState([]) // NOWE: Stan na zarezerwowane zajęcia

	const [trenerzyList, setTrenerzyList] = useState([])
	const [mojeTreningi, setMojeTreningi] = useState([])

	const [czyWszedlNaSilownie, setCzyWszedlNaSilownie] = useState(false)

	useEffect(() => {
		if (!userId) {
			navigate("/login")
			return
		}

		if (widok === "grafik") {
			pobierzGrafikZajec()
			if (isKarnetAktywny) pobierzMojeZajecia()
		}

		if (widok === "trenerzy" && isKarnetAktywny) {
			pobierzWolnychTrenerow()
			pobierzMojeTreningi()
		}

		if (widok === "moje" && isKarnetAktywny) {
			axios
				.get(`http://localhost:5158/api/Workouts/plans/${userId}`)
				.then(res => {
					setPlany(res.data)
					setKomunikat("")
				})
				.catch(err => {
					if (err.response?.status === 404)
						setKomunikat("Nie masz planów. Przejdź do Sklepu.")
				})
		}
	}, [widok, userId, isKarnetAktywny, navigate])

	// --- FUNKCJE DLA HARMONOGRAMU (1 na 1) ---
	const pobierzWolnychTrenerow = async () => {
		try {
			const response = await axios.get(
				"http://localhost:8080/api/harmonogram/wolne",
			)
			setTrenerzyList(response.data)
		} catch (error) {
			setKomunikat("❌ Błąd pobierania wolnych trenerów.")
		}
	}

	const pobierzMojeTreningi = async () => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/harmonogram/klient/${userId}`,
			)
			setMojeTreningi(response.data)
		} catch (error) {
			console.error("Błąd pobierania moich treningów", error)
		}
	}

	const rezerwujTrenera = async treningId => {
		try {
			const response = await axios.post(
				`http://localhost:8080/api/harmonogram/${treningId}/rezerwuj?klientId=${userId}`,
			)
			setKomunikat(response.data)
			pobierzWolnychTrenerow()
			pobierzMojeTreningi()
		} catch (error) {
			setKomunikat("❌ Błąd rezerwacji.")
		}
	}

	// --- FUNKCJE DLA ZAJĘĆ GRUPOWYCH ---
	const pobierzGrafikZajec = async () => {
		try {
			const response = await axios.get(
				"http://localhost:8080/api/zajecia/grafik",
			)
			setZajeciaList(response.data)
		} catch (error) {
			setKomunikat("❌ Błąd pobierania grafiku zajęć.")
		}
	}

	const pobierzMojeZajecia = async () => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/zajecia/klient/${userId}`,
			)
			setMojeZajecia(response.data)
		} catch (error) {
			console.error("Błąd pobierania moich zajęć", error)
		}
	}

	const rezerwujZajecia = async idZajec => {
		try {
			const response = await axios.post(
				`http://localhost:8080/api/zajecia/${idZajec}/rezerwuj?uzytkownikId=${userId}`,
			)
			setKomunikat(response.data)
			pobierzMojeZajecia() // Od razu odświeżamy listę potwierdzonych zapisów!
		} catch (error) {
			setKomunikat("❌ Błąd rezerwacji zajęć grupowych.")
		}
	}

	// --- POZOSTAŁE FUNKCJE (BRAMKA, WYNIKI, SKLEP) ---
	const handleLogout = () => {
		localStorage.clear()
		navigate("/login")
	}

	const symulujWejscieQR = async () => {
		try {
			setKomunikat("⏳ Skanowanie...")
			const response = await axios.post(
				`http://localhost:8080/api/access/checkin?uzytkownikId=${userId}`,
			)
			setKomunikat("✅ " + response.data)
			setCzyWszedlNaSilownie(true)
		} catch (error) {
			setKomunikat("❌ Bramka zamknięta / Błąd skanera.")
		}
	}

	const zakonczTrening = async e => {
		e.preventDefault()
		try {
			const response = await axios.post(
				`http://localhost:8080/api/workouts/sessions/${sessionId}/complete`,
				{ spalonyKcal: parseInt(kcal), czasMinuty: parseInt(czas) },
			)
			setKomunikat("✅ " + response.data)
			setSessionId("")
			setCzas("")
			setKcal("")
		} catch (error) {
			setKomunikat("❌ Błąd zapisu wyników.")
		}
	}

	const oblicz1RM = async e => {
		e.preventDefault()
		try {
			const response = await axios.get(
				`http://localhost:5158/api/Calculators/1rm?ciezar=${ciezar}&powtorzenia=${powtorzenia}`,
			)
			setWynik1RM(response.data.maxCiezar)
		} catch (error) {
			console.error("Błąd kalkulatora", error)
		}
	}

	const zapiszRekord = async () => {
		try {
			const response = await axios.post(
				"http://localhost:5158/api/Workouts/records",
				{
					uzytkownikId: parseInt(userId),
					cwiczenie: "Złożone (1RM)",
					ciezar: wynik1RM,
				},
			)
			setKomunikat("✅ " + response.data)
		} catch (error) {
			setKomunikat("❌ Błąd zapisu rekordu.")
		}
	}

	const kupKarnet = async nazwa => {
		try {
			const response = await axios.post(
				`http://localhost:8080/api/karnety/kup/${userId}`,
				nazwa,
				{ headers: { "Content-Type": "text/plain" } },
			)
			setKomunikat("✅ " + response.data + " Zaloguj się ponownie!")
		} catch (error) {
			setKomunikat("❌ Błąd transakcji.")
		}
	}

	const kupPlan = async cel => {
		try {
			await axios.post(
				`http://localhost:8080/api/members/${userId}/training-plan`,
				{ cel: cel, poziom: "Początkujący" },
			)
			setKomunikat("✅ Plan przypisany.")
			if (isKarnetAktywny) setWidok("moje")
		} catch (error) {
			setKomunikat("❌ Błąd generowania planu.")
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
					alignItems: "center",
					padding: "0 20px",
				}}
			>
				<h2 style={{ color: "#2980b9", margin: 0 }}>
					Witaj w Panelu Klienta! 🏃‍♂️
				</h2>
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
					⚠️ Nie masz aktywnego karnetu! Kup w Sklepie.
				</div>
			)}

			<div
				style={{
					margin: "20px 0",
					display: "flex",
					justifyContent: "center",
					gap: "10px",
				}}
			>
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
					📅 Grupowe
				</button>
				<button
					onClick={() => isKarnetAktywny && setWidok("trenerzy")}
					disabled={!isKarnetAktywny}
					style={{
						padding: "10px 20px",
						backgroundColor:
							widok === "trenerzy"
								? "#16a085"
								: isKarnetAktywny
									? "#bdc3c7"
									: "#95a5a6",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: isKarnetAktywny ? "pointer" : "not-allowed",
						fontWeight: "bold",
					}}
				>
					⌚ Trener (1 na 1)
				</button>
				<button
					onClick={() => isKarnetAktywny && setWidok("moje")}
					disabled={!isKarnetAktywny}
					style={{
						padding: "10px 20px",
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
						fontWeight: "bold",
					}}
				>
					Moje Plany
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
						fontWeight: "bold",
					}}
				>
					🛒 Sklep
				</button>
			</div>

			<hr style={{ width: "80%", borderColor: "#ecf0f1" }} />
			<h3 style={{ color: "#e74c3c" }}>{komunikat}</h3>

			{/* WIDOK: GRAFIK ZAJĘĆ GRUPOWYCH */}
			{widok === "grafik" && (
				<div style={{ marginTop: "20px" }}>
					{/* SEKCJA: ZAPISANE ZAJĘCIA GRUPOWE (NOWE) */}
					{isKarnetAktywny && (
						<>
							<h3 style={{ color: "#8e44ad" }}>Twoje zapisy na zajęcia:</h3>
							{mojeZajecia.length === 0 ? (
								<p style={{ color: "#7f8c8d" }}>Brak zapisów.</p>
							) : null}

							{mojeZajecia.map(rez => (
								<div
									key={rez.id}
									style={{
										border: "2px solid #8e44ad",
										padding: "15px",
										margin: "10px auto",
										width: "400px",
										borderRadius: "8px",
										backgroundColor: "#f5eef8",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div style={{ textAlign: "left" }}>
										<strong>{rez.zajeciaGrupowe.nazwa}</strong>
										<br />
										<span style={{ color: "#2c3e50" }}>
											📅 {rez.zajeciaGrupowe.dataGodzina.replace("T", " ")}
										</span>
									</div>
									<div style={{ color: "#8e44ad", fontWeight: "bold" }}>
										✅ Zapisany
									</div>
								</div>
							))}
							<hr
								style={{
									width: "40%",
									margin: "30px auto",
									borderColor: "#ecf0f1",
								}}
							/>
						</>
					)}

					{/* SEKCJA: DOSTĘPNE ZAJĘCIA GRUPOWE */}
					<h3 style={{ color: "#9b59b6" }}>Dostępny grafik zajęć:</h3>
					{zajeciaList.map(z => (
						<div
							key={z.id}
							style={{
								border: "2px solid #9b59b6",
								padding: "15px",
								margin: "10px auto",
								width: "300px",
								borderRadius: "8px",
								backgroundColor: "#f9f2fa",
							}}
						>
							<h4 style={{ margin: "0 0 10px 0" }}>{z.nazwa}</h4>
							<p style={{ margin: "5px 0" }}>
								Data: {z.dataGodzina.replace("T", " ")}
							</p>
							<button
								onClick={() => rezerwujZajecia(z.id)}
								style={{
									backgroundColor: "#9b59b6",
									color: "white",
									border: "none",
									padding: "8px 15px",
									borderRadius: "5px",
									cursor: "pointer",
									marginTop: "10px",
								}}
							>
								Zarezerwuj
							</button>
						</div>
					))}
				</div>
			)}

			{/* WIDOK: TRENERZY (1 NA 1) */}
			{widok === "trenerzy" && isKarnetAktywny && (
				<div style={{ marginTop: "20px" }}>
					<h3 style={{ color: "#27ae60" }}>Twoje umówione treningi:</h3>
					{mojeTreningi.length === 0 ? (
						<p style={{ color: "#7f8c8d" }}>
							Nie masz jeszcze żadnych rezerwacji.
						</p>
					) : null}

					{mojeTreningi.map(t => (
						<div
							key={t.id}
							style={{
								border: "2px solid #27ae60",
								padding: "15px",
								margin: "10px auto",
								width: "400px",
								borderRadius: "8px",
								backgroundColor: "#eafaf1",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div style={{ textAlign: "left" }}>
								<strong>
									Trener: {t.trener.imie} {t.trener.nazwisko}
								</strong>
								<br />
								<span style={{ color: "#2c3e50" }}>
									📅 {t.dataGodzina.replace("T", " ")}
								</span>
							</div>
							<div style={{ color: "#27ae60", fontWeight: "bold" }}>
								✅ Potwierdzony
							</div>
						</div>
					))}

					<hr
						style={{
							width: "40%",
							margin: "30px auto",
							borderColor: "#ecf0f1",
						}}
					/>

					<h3 style={{ color: "#16a085" }}>Wolne terminy instruktorów:</h3>
					{trenerzyList.length === 0 ? (
						<p>Brak wolnych terminów na ten moment.</p>
					) : null}

					{trenerzyList.map(t => (
						<div
							key={t.id}
							style={{
								border: "2px dashed #16a085",
								padding: "15px",
								margin: "10px auto",
								width: "400px",
								borderRadius: "8px",
								backgroundColor: "#f2fbf9",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div style={{ textAlign: "left" }}>
								<strong>
									Trener: {t.trener.imie} {t.trener.nazwisko}
								</strong>
								<br />
								<span>{t.dataGodzina.replace("T", " ")}</span>
							</div>
							<button
								onClick={() => rezerwujTrenera(t.id)}
								style={{
									backgroundColor: "#16a085",
									color: "white",
									border: "none",
									padding: "8px 15px",
									borderRadius: "5px",
									cursor: "pointer",
									fontWeight: "bold",
								}}
							>
								Rezerwuj
							</button>
						</div>
					))}
				</div>
			)}

			{/* WIDOK: MOJE PLANY I BRAMKA */}
			{widok === "moje" && isKarnetAktywny && (
				<div>
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
										placeholder='ID Sesji'
										value={sessionId}
										onChange={e => setSessionId(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<input
										type='number'
										placeholder='Czas w minutach'
										value={czas}
										onChange={e => setCzas(e.target.value)}
										required
										style={{ padding: "8px", width: "220px" }}
									/>
									<input
										type='number'
										placeholder='Spalone kalorie'
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
									🧮 Kalkulator Siły
								</h3>
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
										}}
									>
										<p>
											1RM to:{" "}
											<span style={{ color: "#e74c3c", fontWeight: "bold" }}>
												{wynik1RM} kg
											</span>
										</p>
										<button
											onClick={zapiszRekord}
											style={{
												width: "100%",
												marginTop: "5px",
												padding: "8px",
												backgroundColor: "#f1c40f",
												border: "none",
												borderRadius: "5px",
												cursor: "pointer",
												fontWeight: "bold",
											}}
										>
											⭐ Zapisz Rekord
										</button>
									</div>
								)}
							</div>
						</>
					)}

					<h3 style={{ marginTop: "40px", color: "#2c3e50" }}>
						Twoje plany treningowe:
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
								<h3 style={{ margin: "0 0 10px 0" }}>{plan.nazwa}</h3>
								<p>
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
						<h3 style={{ color: "#d35400" }}>Plan Odchudzanie</h3>
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
