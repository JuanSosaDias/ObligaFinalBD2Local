const express = require('express');
const router = express.Router();
const pool = require('../database'); 
const verificarToken = require('../middleware/auth'); 

// Obtener el candidato presidente ganador
router.get('/resultados/ganador', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        P.nombre AS nombre,
        P.apellido AS apellido,
        PP.nombre AS partido,
        COUNT(*) AS votos
      FROM (
        SELECT EV.numero_unicoLista
        FROM Es_Valido EV

        UNION ALL

        SELECT EO.numero_unicoLista
        FROM Es_Observado EO
      ) AS votos
      JOIN Rol_Lista_Candidato RLC ON votos.numero_unicoLista = RLC.idLista
      JOIN Rol R ON RLC.idRol = R.id
      JOIN Candidato C ON RLC.idCandidato = C.CI
      JOIN Persona P ON C.CI = P.CI
      JOIN Lista L ON RLC.idLista = L.numero_unico
      JOIN Partido_Politico PP ON L.idPartido_Politico = PP.id
      WHERE R.descripcion = 'Presidente'
      GROUP BY P.nombre, P.apellido, PP.nombre
      ORDER BY votos DESC
      LIMIT 1;
    `);

    res.json(rows[0]); // solo el ganador
  } catch (err) {
    console.error('Error al obtener el candidato presidente ganador:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Votos válidos y observados por lista
router.get('/resultados/listas/:idCircuito', async (req, res) => {
  const { idCircuito } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        L.numero_unico AS numero_lista,
        PP.nombre AS nombre_partido,
        SUM(CASE WHEN EV.idVoto IS NOT NULL THEN 1 ELSE 0 END) AS cantidad_validos,
        SUM(CASE WHEN EO.idVoto IS NOT NULL THEN 1 ELSE 0 END) AS cantidad_observados
      FROM Lista L
      JOIN Partido_Politico PP ON L.idPartido_Politico = PP.id
      LEFT JOIN Es_Valido EV ON L.numero_unico = EV.numero_unicoLista
      LEFT JOIN Voto V1 ON V1.id = EV.idVoto
      LEFT JOIN Es_Observado EO ON L.numero_unico = EO.numero_unicoLista
      LEFT JOIN Voto V2 ON V2.id = EO.idVoto
      WHERE (V1.idCircuito = ? OR V2.idCircuito = ?)
      GROUP BY L.numero_unico, PP.nombre
    `, [idCircuito, idCircuito]);

    res.json({ resultados: rows });
  } catch (err) {
    console.error('Error al obtener resultados:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Votos anulados y en blanco por circuito
router.get('/resultados/diferentes/:idCircuito', async (req, res) => {
  const { idCircuito } = req.params;

  try {
    const [[{ cantidad_anulados }]] = await pool.query(`
      SELECT COUNT(*) AS cantidad_anulados
      FROM Voto V
      JOIN Es_Anulado EA ON V.id = EA.idVoto
      WHERE V.idCircuito = ?;
    `, [idCircuito]);

    const [[{ cantidad_en_blanco }]] = await pool.query(`
      SELECT COUNT(*) AS cantidad_en_blanco
      FROM Voto V
      JOIN En_Blanco EB ON V.id = EB.idVoto
      WHERE V.idCircuito = ?;
    `, [idCircuito]);

    res.json({ cantidad_anulados, cantidad_en_blanco });
  } catch (err) {
    console.error('Error al obtener anulados/en blanco:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ruta para obtener resultados por partido en un circuito específico
router.get('/resultados/partidos/:idCircuito', async (req, res) => {
  const { idCircuito } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        PP.nombre AS partido,
        COUNT(*) AS votos
      FROM (
        SELECT EV.idVoto, L.idPartido_Politico
        FROM Es_Valido EV
        JOIN Voto V ON V.id = EV.idVoto
        JOIN Lista L ON EV.numero_unicoLista = L.numero_unico
        WHERE V.idCircuito = ?

        UNION ALL

        SELECT EO.idVoto, L.idPartido_Politico
        FROM Es_Observado EO
        JOIN Voto V ON V.id = EO.idVoto
        JOIN Lista L ON EO.numero_unicoLista = L.numero_unico
        WHERE V.idCircuito = ?
      ) AS sub
      JOIN Partido_Politico PP ON sub.idPartido_Politico = PP.id
      GROUP BY PP.nombre;
    `, [idCircuito, idCircuito]);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener resultados por partido:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//ruta paa obtener resultados por candidato en un circuito específico
router.get('/resultados/candidatos/:idCircuito', async (req, res) => {
  const { idCircuito } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
          p.nombre AS nombre_partido,
          CONCAT(per.nombre, ' ', per.apellido) AS nombre_candidato,
          COUNT(*) AS cantidad_votos
      FROM Voto v
      LEFT JOIN Es_Valido ev ON v.id = ev.idVoto
      LEFT JOIN Es_Observado eo ON v.id = eo.idVoto
      LEFT JOIN Lista l ON l.numero_unico = COALESCE(ev.numero_unicoLista, eo.numero_unicoLista)
      JOIN Rol_Lista_Candidato rlc ON rlc.idLista = l.numero_unico AND rlc.idRol = 1
      JOIN Candidato c ON rlc.idCandidato = c.CI AND c.id_PartidoPolitico = l.idPartido_Politico
      JOIN Persona per ON c.CI = per.CI
      JOIN Partido_Politico p ON c.id_PartidoPolitico = p.id
      WHERE v.idCircuito = ? AND (ev.idVoto IS NOT NULL OR eo.idVoto IS NOT NULL)
      GROUP BY p.nombre, per.nombre, per.apellido
      ORDER BY cantidad_votos DESC;
    `, [idCircuito]);

    res.json({ resultados: rows });
  } catch (error) {
    console.error('Error al obtener resultados por candidato:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Para listar los departamentos en las paginas del os resultados por depto
router.get('/departamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM Departamento');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener departamentos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Resultados por partido en un departamento
router.get('/resultados/partido/departamento/:idDepartamento', async (req, res) => {
  const { idDepartamento } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        PP.nombre AS partido,
        COUNT(*) AS votos
      FROM (
        SELECT EV.idVoto, L.idPartido_Politico
        FROM Es_Valido EV
        JOIN Voto V ON V.id = EV.idVoto
        JOIN Lista L ON EV.numero_unicoLista = L.numero_unico
        JOIN Circuito C ON V.idCircuito = C.id
        JOIN Establecimiento E ON C.idEstablecimiento = E.id
        JOIN Zona Z ON E.idZona = Z.id
        WHERE Z.idDepartamento = ?

        UNION ALL

        SELECT EO.idVoto, L.idPartido_Politico
        FROM Es_Observado EO
        JOIN Voto V ON V.id = EO.idVoto
        JOIN Lista L ON EO.numero_unicoLista = L.numero_unico
        JOIN Circuito C ON V.idCircuito = C.id
        JOIN Establecimiento E ON C.idEstablecimiento = E.id
        JOIN Zona Z ON E.idZona = Z.id
        WHERE Z.idDepartamento = ?
      ) AS sub
      JOIN Partido_Politico PP ON sub.idPartido_Politico = PP.id
      GROUP BY PP.nombre;
    `, [idDepartamento, idDepartamento]);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener resultados por departamento:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Resultados por candidato presidencial en un departamento
router.get('/resultados/candidato/departamento/:idDepartamento', async (req, res) => {
  const { idDepartamento } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        P.nombre AS nombre,
        P.apellido AS apellido,
        PP.nombre AS partido,
        COUNT(*) AS votos
      FROM (
        SELECT EV.idVoto, EV.numero_unicoLista
        FROM Es_Valido EV
        JOIN Voto V ON V.id = EV.idVoto
        JOIN Circuito C ON V.idCircuito = C.id
        JOIN Establecimiento E ON C.idEstablecimiento = E.id
        JOIN Zona Z ON E.idZona = Z.id
        WHERE Z.idDepartamento = ?

        UNION ALL

        SELECT EO.idVoto, EO.numero_unicoLista
        FROM Es_Observado EO
        JOIN Voto V ON V.id = EO.idVoto
        JOIN Circuito C ON V.idCircuito = C.id
        JOIN Establecimiento E ON C.idEstablecimiento = E.id
        JOIN Zona Z ON E.idZona = Z.id
        WHERE Z.idDepartamento = ?
      ) AS votos
      JOIN Rol_Lista_Candidato RLC ON votos.numero_unicoLista = RLC.idLista
      JOIN Rol R ON RLC.idRol = R.id
      JOIN Candidato C ON RLC.idCandidato = C.CI
      JOIN Persona P ON C.CI = P.CI
      JOIN Lista L ON RLC.idLista = L.numero_unico
      JOIN Partido_Politico PP ON L.idPartido_Politico = PP.id
      WHERE R.descripcion = 'Presidente'
      GROUP BY P.nombre, P.apellido, PP.nombre
      ORDER BY votos DESC;
    `, [idDepartamento, idDepartamento]);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener resultados por candidato a presidente:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
