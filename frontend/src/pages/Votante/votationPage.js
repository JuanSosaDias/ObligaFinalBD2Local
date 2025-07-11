import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../../Styles/votationPage.css";
import Card from "../../Components/Card";
import logo from '../../assets/CortElecLOGO.png';

function VotationPage() {
  const [listas, setListas] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState("todos");
  const [integrantesPorLista, setIntegrantesPorLista] = useState({});
  const [listasSeleccionadas, setListasSeleccionadas] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [forzarBlanco, setForzarBlanco] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [contador, setContador] = useState(10);
  const navigate = useNavigate();

  // validar token y redirigir si no lo tiene
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        sessionStorage.clear();
        navigate("/");
      }
    } catch (e) {
      sessionStorage.clear();
      navigate("/");
    }
  }, [navigate]);

  // bloqueo la ida para atras en el navegador
  useEffect(() => {
    const bloquearAtras = (e) => {
      e.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', bloquearAtras);

    return () => {
      window.removeEventListener('popstate', bloquearAtras);
    };
  }, []);

  // contador y redireccion cuando el usuario ya votó
  useEffect(() => {
    if (mostrarExito) {
      setContador(10);
      const interval = setInterval(() => {
        setContador(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            sessionStorage.clear();
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mostrarExito, navigate]);

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const res = await fetch('http://localhost:4000/partidos');
        const data = await res.json();
        setPartidos(data);
      } catch (error) {
        console.error("Error al traer partidos:", error);
      }
    };
    fetchPartidos();
  }, []);

  useEffect(() => {
    const fetchListas = async () => {
      try {
        const url = partidoSeleccionado === "todos"
          ? 'http://localhost:4000/listas'
          : `http://localhost:4000/listas/partido/${partidoSeleccionado}`;
        const response = await fetch(url);
        const data = await response.json();
        setListas(data);
      } catch (error) {
        console.error("Error al traer las listas:", error);
      }
    };
    fetchListas();
  }, [partidoSeleccionado]);

  useEffect(() => {
    const fetchIntegrantes = async () => {
      try {
        const res = await fetch('http://localhost:4000/integrantes');
        const data = await res.json();
        setIntegrantesPorLista(data);
      } catch (error) {
        console.error("Error al traer integrantes:", error);
      }
    };
    fetchIntegrantes();
  }, []);

  const handleCardClick = (numeroLista) => {
    setListasSeleccionadas((prev) =>
      prev.includes(numeroLista)
        ? prev.filter((num) => num !== numeroLista)
        : [...prev, numeroLista]
    );
  };

  const emitirVoto = async (forzarBlanco) => {
    const fecha = new Date();
    const fechaEmitido = fecha.toISOString().split("T")[0];
    const horaEmitido = fecha.toTimeString().split(" ")[0];
    const idCircuito = Number(sessionStorage.getItem("idCircuito"));
    const esObservado = sessionStorage.getItem("esObservado") === "true";

    try {
      const votoRes = await fetch("http://localhost:4000/voto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha_emitido: fechaEmitido, hora_emitido: horaEmitido, idCircuito }),
      });

      const voto = await votoRes.json();
      const idVoto = voto.insertId;

      if (forzarBlanco || listasSeleccionadas.length === 0) {
        await fetch("http://localhost:4000/voto/blanco", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idVoto }),
        });
      } else if (listasSeleccionadas.length === 1) {
        const endpoint = esObservado
          ? "http://localhost:4000/voto/observado"
          : "http://localhost:4000/voto/valido";

        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idVoto, numero_unicoLista: listasSeleccionadas[0] }),
        });

      } else {
        await fetch("http://localhost:4000/voto/anulado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idVoto }),
        });
      }

      setMostrarExito(true);

      const token = sessionStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const { serie, numero } = decoded;
        await fetch("http://localhost:4000/voto/marcarYavoto", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serie, numero }),
        });
      }

      setListasSeleccionadas([]);
    } catch (err) {
      console.error("Error al emitir el voto:", err);
    }
  };

  const solicitarConfirmacion = (blanco) => {
    setForzarBlanco(blanco);
    setMostrarConfirmacion(true);
  };

  const confirmarVoto = () => {
    emitirVoto(forzarBlanco);
    setMostrarConfirmacion(false);
  };

  const cancelarVoto = () => {
    setMostrarConfirmacion(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: 'auto' }} />
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p>ELECCIONES 2025</p>
          <p>¿A QUIÉN VAS A VOTAR?</p>
        </div>
      </header>

      <div className="selector-container">
        <label htmlFor="partido-select">Filtrar por partido:</label>
        <select
          id="partido-select"
          onChange={(e) => setPartidoSeleccionado(e.target.value)}
        >
          <option value="todos">Todos</option>
          {partidos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <button className="btn-votar" onClick={() => solicitarConfirmacion(false)}>
          VOTAR
        </button>

        <button className="btn-blanco" onClick={() => solicitarConfirmacion(true)}>
          VOTO BLANCO
        </button>
      </div>

      <div className="cards-container">
        {listas.map((item, index) => (
          <Card
            key={index}
            integrantes={integrantesPorLista[item.numberlist] || []}
            mode="dark"
            photocandidate={item.photocandidate}
            namecandidate={item.namepartido}
            numberlist={item.numberlist}
            isSelected={listasSeleccionadas.includes(item.numberlist)}
            onClick={() => handleCardClick(item.numberlist)}
          />
        ))}
      </div>

      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmación de voto</h3>
            <p>¿Está seguro que desea confirmar su voto?</p>
            <div style={{ marginTop: "20px" }}>
              <button className="confirm-button" style={{ marginRight: "10px", padding: "8px 16px" }} onClick={confirmarVoto}>
                CONFIRMAR
              </button>
              <button className="cancel-button" style={{ padding: "8px 16px" }} onClick={cancelarVoto}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarExito && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ fontSize: "48px", color: "#28a745" }}>✅</div>
            <h3>Voto exitoso</h3>
            <p>Su voto se registró correctamente.</p>
            <p>Será redirigido en <strong>{contador}</strong> segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VotationPage;
