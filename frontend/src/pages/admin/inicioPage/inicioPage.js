import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './inicioPage.css';
import logo from '../../../assets/CortElecLOGO.png';

function InicioPage() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [errorHabilitacion, setErrorHabilitacion] = useState('');
  const [datosPresidente, setDatosPresidente] = useState({
    ci: '',
    nombre: '',
    apellido: '',
    numeroMesa: '',
    idCircuito: '',
    establecimiento: ''
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    const verificarToken = async () => {
      const token = sessionStorage.getItem('token');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/admin/inicio', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          sessionStorage.removeItem('token');
          navigate('/admin/login');
          return;
        }

        const data = await res.json();
        setDatosPresidente({
          ci: data.usuario,
          nombre: data.nombre,
          apellido: data.apellido,
          numeroMesa: data.numeroMesa,
          idCircuito: data.idCircuito,
          establecimiento: data.establecimiento,
          departamento: data.departamento
        });

        // Guardamos datos en sessionStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('ci', data.usuario);
        sessionStorage.setItem('establecimiento', data.establecimiento);
        sessionStorage.setItem('nombre', data.nombre);
        sessionStorage.setItem('apellido', data.apellido);
        sessionStorage.setItem('numeroMesa', data.numeroMesa);
        sessionStorage.setItem('idCircuito', data.idCircuito);
        sessionStorage.setItem('departamento', data.departamento);

      } catch (err) {
        console.error('Error al verificar token:', err);
        sessionStorage.clear();
        navigate('/admin/login'); 
      }
    };

    verificarToken();
  }, [navigate]);

  const confirmarHabilitacion = async () => {
  const idCircuito = datosPresidente.idCircuito;

  // Obtener hora actual en zona de Uruguay
 /* const ahora = new Date().toLocaleTimeString('es-UY', {
    timeZone: 'America/Montevideo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const [hora, minuto] = ahora.split(':').map(Number);

  if (hora < 8 || (hora === 8 && minuto < 30)) {
    setErrorHabilitacion('No se puede habilitar la votación antes de las 08:30 en Uruguay.');
    return;
  }*/

  try {
    const res = await fetch(`http://localhost:4000/habilitarVotacion/${idCircuito}`, {
      method: 'POST'
    });

    if (!res.ok) {
      console.error('Error al habilitar votación');
      return;
    }

    setMostrarModal(false);
    navigate('/admin/elecciones/enCurso');
    
  } catch (err) {
    console.error('Error al habilitar votación:', err);
  }
};

  const salir = () => {
    sessionStorage.clear();
    navigate('/admin/login');
  };

  return (
    <div className="habilitar-wrapper">
      <header className="inicio-header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="logo" />
          <h2>Elecciones Presidenciales</h2>
          <button className="salir-btn" onClick={salir}>Salir</button>
        </div>
      </header>

      <h2>Bienvenido/a presidente {datosPresidente.nombre} {datosPresidente.apellido}</h2>

      <div className="info-box">
        <p><strong>Mesa N°</strong> {datosPresidente.numeroMesa}</p>
        <p><strong>Circuito N°</strong> {datosPresidente.idCircuito}</p>
        <p><strong>Establecimiento:</strong> {datosPresidente.establecimiento}</p>
        <p><strong>Departamento:</strong> {datosPresidente.departamento}</p>
      </div>

      <h3 className="bienvenida">
        Haga Click en el botón "Habilitar Mesa" para comenzar la votación en el Circuito.
      </h3>

      <button className="boton-habilitar" onClick={() => setMostrarModal(true)}>
        Habilitar Mesa
      </button>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>¿Seguro que desea habilitar la mesa?</p>
            <button className="confirmar" onClick={confirmarHabilitacion}>Confirmar</button>
            <button className="cancelar" onClick={() => {
              setMostrarModal(false);
              setErrorHabilitacion('');
            }}>Cancelar</button>
            {errorHabilitacion && <p className="error-texto">{errorHabilitacion}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default InicioPage;
