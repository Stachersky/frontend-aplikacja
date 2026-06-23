import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function PanelInstruktora() {
	const navigate = useNavigate()
	const instruktorId = localStorage.getItem("userId")

	const [widok, setWidok] = useState("plany")
	const [komunikat, setKomunikat] = useState("")

	const [klientId, setKlientId] = useState("")
	const [cel, setCel] = useState("Odchudzanie")
	const [poziom, setPoziom] = useState("Początkujący")

	const [nazwaZajec, setNazwaZajec] = useState("Joga")
	const [dataGodzina, setDataGodzina] = useState("")
	const [limitMiejsc, setLimitMiejsc] = useState(15)
	const [zajeciaList, setZajeciaList] = useState([]) // NOWE: Lista zajęć dla instruktora

	const [nowyTermin, setNowyTermin] = useState("")
	const [mojHarmonogram, setMojHarmonogram] = useState([])

	useEffect(() => {
		if (widok === "harmonogram") pobierzMojHarmonogram()
		if (widok === "grafik") pobierzGrafikZajec() // Pobiera zajęcia gdy wchodzimy w zakładkę
	}, [widok])

	// --- FUNKCJE DLA HARMONOGRAMU 1 NA 1 ---
	const pobierzMojHarmonogram = async () => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/harmonogram/trener/${instruktorId}`,
			)
			setMojHarmonogram(response.data)
		} catch (error) {
			console.error("Błąd", error)
		}
	}

	const handleDodajTermin = async e => {
		e.preventDefault()
		setKomunikat("⏳ Dodawanie terminu...")
		try {
			const response = await axios.post(
				`http://localhost:8080/api/harmonogram/dodaj?trenerId=${instruktorId}`,
				nowyTermin,
				{ headers: { "Content-Type": "application/json" } },
			)
			setKomunikat(response.data)
			setNowyTermin("")
			pobierzMojHarmonogram()
		} catch (error) {
			setKomunikat("❌ Błąd dodawania terminu.")
		}
	}

	// 🆕 NOWE: Instruktor usuwa swój termin
	const usunTerminPersonalny = async treningId => {
		if (
			window.confirm("Na pewno chcesz usunąć ten termin ze swojego grafiku?")
		) {
			try {
				const response = await axios.delete(
					`http://localhost:8080/api/harmonogram/${treningId}/usun`,
				)
				setKomunikat(response.data)
				pobierzMojHarmonogram()
			} catch (error) {
				setKomunikat("❌ Błąd usuwania terminu.")
			}
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
			console.error("Błąd pobierania grafiku zajęć.")
		}
	}

	const handleDodajZajecia = async e => {
		e.preventDefault()
		setKomunikat("⏳ Dodawanie zajęć do grafiku...")
		try {
			const response = await axios.post(
				`http://localhost:8080/api/zajecia/dodaj?trenerId=${instruktorId}`,
				{
					nazwa: nazwaZajec,
					dataGodzina: dataGodzina,
					limitMiejsc: parseInt(limitMiejsc),
				},
			)
			setKomunikat(response.data)
			setDataGodzina("")
			pobierzGrafikZajec() // Odświeża tabelkę po dodaniu
		} catch (error) {
			setKomunikat("❌ Błąd. Serwer Java nie odpowiada.")
		}
	}

	// 🆕 NOWE: Instruktor usuwa całe zajęcia grupowe
	const usunZajeciaGrupowe = async zajeciaId => {
		if (
			window.confirm(
				"UWAGA: Czy na pewno chcesz całkowicie usunąć te zajęcia z systemu?",
			)
		) {
			try {
				const response = await axios.delete(
					`http://localhost:8080/api/zajecia/${zajeciaId}/usun`,
				)
				setKomunikat(response.data)
				pobierzGrafikZajec()
			} catch (error) {
				if (error.response) setKomunikat(error.response.data)
			}
		}
	}

	const handleLogout = () => {
		localStorage.clear()
		navigate("/login")
	}

	const handleStworzPlan = async e => {
		e.preventDefault()
		setKomunikat("⏳ Generowanie planu w C#...")
		try {
			await axios.post(
				`http://localhost:8080/api/members/${klientId}/training-plan`,
				{ cel: cel, poziom: poziom },
			)
			setKomunikat(
				"✅ Sukces! Plan został wygenerowany i przypisany do klienta.",
			)
			setKlientId("")
		} catch (error) {
			setKomunikat("❌ Wystąpił błąd komunikacji mikrousług.")
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
				<h2 style={{ color: "#d35400" }}>Witaj w Panelu Instruktora! 🏋️‍♀️</h2>
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

			<div
				style={{
					margin: "20px 0",
					display: "flex",
					justifyContent: "center",
					gap: "10px",
				}}
			>
				<button
					onClick={() => setWidok("plany")}
					style={{
						padding: "10px 20px",
						backgroundColor: widok === "plany" ? "#d35400" : "#bdc3c7",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						fontWeight: "bold",
					}}
				>
					📝 Kreator Planów
				</button>
				<button
					onClick={() => setWidok("grafik")}
					style={{
						padding: "10px 20px",
						backgroundColor: widok === "grafik" ? "#2980b9" : "#bdc3c7",
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
					onClick={() => setWidok("harmonogram")}
					style={{
						padding: "10px 20px",
						backgroundColor: widok === "harmonogram" ? "#16a085" : "#bdc3c7",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						fontWeight: "bold",
					}}
				>
					⌚ Harmonogram (1 na 1)
				</button>
			</div>

			<hr
				style={{ width: "80%", borderColor: "#ecf0f1", marginBottom: "20px" }}
			/>
			<h3 style={{ color: "#c0392b" }}>{komunikat}</h3>

			{widok === "plany" && (
				<div
					style={{
						border: "2px dashed #d35400",
						padding: "20px",
						width: "350px",
						margin: "0 auto",
						borderRadius: "8px",
						backgroundColor: "#fdf5e6",
					}}
				>
					<h3 style={{ color: "#d35400", marginTop: 0 }}>Przypisz nowy plan</h3>
					<form onSubmit={handleStworzPlan}>
						<div style={{ marginBottom: "15px" }}>
							<label>ID Klienta: </label>
							<br />
							<input
								type='number'
								value={klientId}
								onChange={e => setKlientId(e.target.value)}
								required
								style={{ padding: "8px", width: "90%" }}
							/>
						</div>
						<div style={{ marginBottom: "15px" }}>
							<label>Cel treningowy: </label>
							<br />
							<select
								value={cel}
								onChange={e => setCel(e.target.value)}
								style={{ padding: "8px", width: "95%" }}
							>
								<option value='Odchudzanie'>Odchudzanie</option>
								<option value='Budowa Masy'>Budowa Masy Mięśniowej</option>
								<option value='Siła'>Wzrost Siły</option>
							</select>
						</div>
						<div style={{ marginBottom: "20px" }}>
							<label>Poziom zaawansowania: </label>
							<br />
							<select
								value={poziom}
								onChange={e => setPoziom(e.target.value)}
								style={{ padding: "8px", width: "95%" }}
							>
								<option value='Początkujący'>Początkujący</option>
								<option value='Średniozaawansowany'>Średniozaawansowany</option>
								<option value='Zaawansowany'>Zaawansowany</option>
							</select>
						</div>
						<button
							type='submit'
							style={{
								width: "100%",
								padding: "10px",
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
			)}

			{widok === "grafik" && (
				<div>
					<div
						style={{
							border: "2px dashed #2980b9",
							padding: "20px",
							width: "350px",
							margin: "0 auto",
							borderRadius: "8px",
							backgroundColor: "#f4f9fd",
						}}
					>
						<h3 style={{ color: "#2980b9", marginTop: 0 }}>
							Nowe zajęcia grupowe
						</h3>
						<form onSubmit={handleDodajZajecia}>
							<div style={{ marginBottom: "15px" }}>
								<label>Rodzaj zajęć: </label>
								<br />
								<select
									value={nazwaZajec}
									onChange={e => setNazwaZajec(e.target.value)}
									style={{ padding: "8px", width: "95%" }}
								>
									<option value='Joga'>🧘‍♀️ Joga</option>
									<option value='Crossfit'>🏋️‍♂️ Crossfit</option>
								</select>
							</div>
							<div style={{ marginBottom: "15px" }}>
								<label>Data i godzina: </label>
								<br />
								<input
									type='datetime-local'
									value={dataGodzina}
									onChange={e => setDataGodzina(e.target.value)}
									required
									style={{ padding: "8px", width: "90%" }}
								/>
							</div>
							<div style={{ marginBottom: "20px" }}>
								<label>Limit miejsc: </label>
								<br />
								<input
									type='number'
									value={limitMiejsc}
									onChange={e => setLimitMiejsc(e.target.value)}
									required
									min='1'
									max='50'
									style={{ padding: "8px", width: "90%" }}
								/>
							</div>
							<button
								type='submit'
								style={{
									width: "100%",
									padding: "10px",
									cursor: "pointer",
									backgroundColor: "#2980b9",
									color: "white",
									border: "none",
									borderRadius: "5px",
									fontWeight: "bold",
								}}
							>
								➕ Dodaj do grafiku
							</button>
						</form>
					</div>

					{/* 🆕 NOWE: Wyświetlanie grafiku dla instruktora z opcją usunięcia */}
					<h3 style={{ marginTop: "30px", color: "#2980b9" }}>
						Aktualny grafik zajęć:
					</h3>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{zajeciaList.map(z => (
							<div
								key={z.id}
								style={{
									border: "1px solid #ddd",
									padding: "15px",
									margin: "5px",
									width: "400px",
									borderRadius: "5px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									backgroundColor: "#fff",
								}}
							>
								<div style={{ textAlign: "left" }}>
									<strong>{z.nazwa}</strong> ({z.limitMiejsc} miejsc)
									<br />
									<span style={{ color: "#7f8c8d" }}>
										📅 {z.dataGodzina.replace("T", " ")}
									</span>
								</div>
								{/* Wyświetlamy kosz tylko jeśli to zalogowany trener dodał te zajęcia */}
								{z.trener.id === parseInt(instruktorId) && (
									<button
										onClick={() => usunZajeciaGrupowe(z.id)}
										style={{
											backgroundColor: "#e74c3c",
											color: "white",
											border: "none",
											padding: "8px 12px",
											borderRadius: "5px",
											cursor: "pointer",
											fontWeight: "bold",
										}}
									>
										🗑️ Usuń
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{widok === "harmonogram" && (
				<div>
					<div
						style={{
							border: "2px dashed #16a085",
							padding: "20px",
							width: "350px",
							margin: "0 auto",
							borderRadius: "8px",
							backgroundColor: "#f2fbf9",
						}}
					>
						<h3 style={{ color: "#16a085", marginTop: 0 }}>
							Wystaw wolny termin (1 na 1)
						</h3>
						<form onSubmit={handleDodajTermin}>
							<div style={{ marginBottom: "15px" }}>
								<label>Data i godzina dostępności: </label>
								<br />
								<input
									type='datetime-local'
									value={nowyTermin}
									onChange={e => setNowyTermin(e.target.value)}
									required
									style={{ padding: "8px", width: "90%", marginTop: "5px" }}
								/>
							</div>
							<button
								type='submit'
								style={{
									width: "100%",
									padding: "10px",
									cursor: "pointer",
									backgroundColor: "#16a085",
									color: "white",
									border: "none",
									borderRadius: "5px",
									fontWeight: "bold",
								}}
							>
								➕ Wystaw termin
							</button>
						</form>
					</div>

					<h3 style={{ marginTop: "30px", color: "#16a085" }}>
						Twój aktualny grafik personalny:
					</h3>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{mojHarmonogram.map(h => (
							<div
								key={h.id}
								style={{
									border: "1px solid #ddd",
									padding: "15px",
									margin: "5px",
									width: "400px",
									borderRadius: "5px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									backgroundColor: h.status === "WOLNY" ? "#fff" : "#e8f8f5",
								}}
							>
								<div style={{ textAlign: "left" }}>
									<strong>📅 {h.dataGodzina.replace("T", " ")}</strong>
									<br />
									<span
										style={{
											color: h.status === "WOLNY" ? "#7f8c8d" : "#27ae60",
											fontWeight: "bold",
										}}
									>
										{h.status === "WOLNY"
											? "Wolny"
											: `Zajęte przez: Klient ID ${h.klient?.id}`}
									</span>
								</div>
								{/* 🆕 NOWE: Kosz do usuwania swoich terminów */}
								<button
									onClick={() => usunTerminPersonalny(h.id)}
									style={{
										backgroundColor: "#e74c3c",
										color: "white",
										border: "none",
										padding: "8px 12px",
										borderRadius: "5px",
										cursor: "pointer",
										fontWeight: "bold",
									}}
								>
									🗑️
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default PanelInstruktora
