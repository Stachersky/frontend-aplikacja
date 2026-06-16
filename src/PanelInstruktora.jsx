import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function PanelInstruktora() {
	const navigate = useNavigate()
	const instruktorId = localStorage.getItem("userId")

	const [widok, setWidok] = useState("plany")
	const [komunikat, setKomunikat] = useState("")

	// STANY: KREATOR PLANÓW
	const [klientId, setKlientId] = useState("")
	const [cel, setCel] = useState("Odchudzanie")
	const [poziom, setPoziom] = useState("Początkujący")

	// STANY: ZAJĘCIA GRUPOWE
	const [nazwaZajec, setNazwaZajec] = useState("Joga")
	const [dataGodzina, setDataGodzina] = useState("")
	const [limitMiejsc, setLimitMiejsc] = useState(15)

	// STANY: HARMONOGRAM 1 na 1
	const [nowyTermin, setNowyTermin] = useState("")
	const [mojHarmonogram, setMojHarmonogram] = useState([])

	useEffect(() => {
		if (widok === "harmonogram") {
			pobierzMojHarmonogram()
		}
	}, [widok])

	const pobierzMojHarmonogram = async () => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/harmonogram/trener/${instruktorId}`,
			)
			setMojHarmonogram(response.data)
		} catch (error) {
			console.error("Błąd pobierania harmonogramu", error)
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
			pobierzMojHarmonogram() // Odświeżamy tabelkę po dodaniu
		} catch (error) {
			setKomunikat("❌ Błąd dodawania terminu.")
		}
	}

	const handleLogout = () => {
		localStorage.clear()
		navigate("/login")
	}

	const handleStworzPlan = async e => {
		/* Twój dotychczasowy kod planów */
		e.preventDefault()
		setKomunikat("⏳ Generowanie planu w C# (trwa komunikacja mikrousług)...")
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
			setKomunikat("❌ Wystąpił błąd. Sprawdź, czy Java i C# są włączone!")
		}
	}

	const handleDodajZajecia = async e => {
		/* Twój dotychczasowy kod zajęć */
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
		} catch (error) {
			setKomunikat("❌ Błąd sieci. Serwer Java nie odpowiada.")
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

			{/* ZAKŁADKI */}
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

				{/* NOWA ZAKŁADKA */}
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
								placeholder='np. 2'
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
			)}

			{/* WIDOK 3: HARMONOGRAM PERSONALNY */}
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

					<h3 style={{ marginTop: "30px" }}>
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
									backgroundColor: h.status === "WOLNY" ? "#fff" : "#e8f8f5",
								}}
							>
								<div>
									<strong>{h.dataGodzina.replace("T", " ")}</strong>
								</div>
								<div
									style={{
										color: h.status === "WOLNY" ? "#7f8c8d" : "#27ae60",
										fontWeight: "bold",
									}}
								>
									{h.status === "WOLNY"
										? "Wolny"
										: `Zajęte przez: Klient ID ${h.klient?.id}`}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default PanelInstruktora
