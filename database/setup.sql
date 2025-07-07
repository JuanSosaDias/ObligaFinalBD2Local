CREATE TABLE Persona (
    CI VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    edad INT
);

CREATE TABLE Departamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Zona (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    idDepartamento INT,
    FOREIGN KEY (idDepartamento) REFERENCES Departamento(id)
);

CREATE TABLE Establecimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    ubicacion VARCHAR(200),
    idZona INT,
    FOREIGN KEY (idZona) REFERENCES Zona(id)
);

CREATE TABLE Partido_Politico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    direccion_sede VARCHAR(200),
    presidente VARCHAR(100),
    vicepresidente VARCHAR(100)
);

CREATE TABLE Candidato (
    CI VARCHAR(20),
    id_PartidoPolitico INT,
    PRIMARY KEY (CI, id_PartidoPolitico),
    FOREIGN KEY (CI) REFERENCES Persona(CI),
    FOREIGN KEY (id_PartidoPolitico) REFERENCES Partido_Politico(id)
);


CREATE TABLE Agente_Policial (
    comisaria VARCHAR(100),
    CI VARCHAR(20) PRIMARY KEY,
    idEstablecimiento INT,
    FOREIGN KEY (CI) REFERENCES Persona(CI),
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(id)
);

CREATE TABLE Miembro_Mesa (
    organismo_trabaja VARCHAR(100),
    CI VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (CI) REFERENCES Persona(CI)
);

CREATE TABLE Presidente_Mesa (
    CI VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (CI) REFERENCES Persona(CI)
);

CREATE TABLE Secretario_Mesa (
    CI VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (CI) REFERENCES Persona(CI)
);

CREATE TABLE Vocal_Mesa (
    CI VARCHAR(20) PRIMARY KEY,
    FOREIGN KEY (CI) REFERENCES Persona(CI)
);

CREATE TABLE Circuito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    es_accesible BOOLEAN,
    idEstablecimiento INT,
    FOREIGN KEY (idEstablecimiento) REFERENCES Establecimiento(id)
);

CREATE TABLE Mesa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa INT,
    idCircuito INT,
    CIPresidente VARCHAR(20),
    CISecretario VARCHAR(20),
    CIVocal VARCHAR(20),
    FOREIGN KEY (idCircuito) REFERENCES Circuito(id),
    FOREIGN KEY (CIPresidente) REFERENCES Presidente_Mesa(CI),
    FOREIGN KEY (CISecretario) REFERENCES Secretario_Mesa(CI),
    FOREIGN KEY (CIVocal) REFERENCES Vocal_Mesa(CI)
);

CREATE TABLE Credencial_Civica (
    serie VARCHAR(10),
    numero VARCHAR(10),
    CI VARCHAR(20),
    idCircuito INT,
    yavoto BOOLEAN,
	PRIMARY KEY (serie, numero),
    FOREIGN KEY (CI) REFERENCES Persona(CI),
    FOREIGN KEY (idCircuito) REFERENCES Circuito(id)
);

CREATE TABLE Voto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_emitido DATE,
    hora_emitido TIME,
    idCircuito INT,
    FOREIGN KEY (idCircuito) REFERENCES Circuito(id)
);

CREATE TABLE Lista (
    numero_unico INT PRIMARY KEY,
    imagen VARCHAR(300),
    idPartido_Politico INT,
    FOREIGN KEY (idPartido_Politico) REFERENCES Partido_Politico(id)
);

CREATE TABLE Es_Valido (
    idVoto INT,
    numero_unicoLista INT,
    PRIMARY KEY (idVoto, numero_unicoLista),
    FOREIGN KEY (idVoto) REFERENCES Voto(id),
    FOREIGN KEY (numero_unicoLista) REFERENCES Lista(numero_unico)
);

CREATE TABLE Es_Observado (
    idVoto INT,
    numero_unicoLista INT,
    PRIMARY KEY (idVoto, numero_unicoLista),
    FOREIGN KEY (idVoto) REFERENCES Voto(id),
    FOREIGN KEY (numero_unicoLista) REFERENCES Lista(numero_unico)
);

CREATE TABLE Es_Anulado (
    idVoto INT PRIMARY KEY,
    FOREIGN KEY (idVoto) REFERENCES Voto(id)
);

CREATE TABLE En_Blanco (
    idVoto INT PRIMARY KEY,
    FOREIGN KEY (idVoto) REFERENCES Voto(id)
);

CREATE TABLE Departamental (
    numero_unicoLista INT PRIMARY KEY,
    FOREIGN KEY (numero_unicoLista) REFERENCES Lista(numero_unico)
);

CREATE TABLE Presidencial (
    numero_unicoLista INT PRIMARY KEY,
    FOREIGN KEY (numero_unicoLista) REFERENCES Lista(numero_unico)
);

CREATE TABLE Plebiscito (
    numero_unicoLista INT PRIMARY KEY,
    FOREIGN KEY (numero_unicoLista) REFERENCES Lista(numero_unico)
);

CREATE TABLE Rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100)
);


CREATE TABLE Rol_Lista_Candidato (
    numero_orden INT,
    idLista INT,
    idCandidato VARCHAR(20),
    idRol INT,     
    PRIMARY KEY (idLista, idCandidato),
    FOREIGN KEY (idLista) REFERENCES Lista(numero_unico),
    FOREIGN KEY (idCandidato) REFERENCES Candidato(CI),
    FOREIGN KEY (idRol) REFERENCES Rol(id)
);

CREATE TABLE EstadoVotacion (
  idCircuito INT PRIMARY KEY,
  habilitada BOOLEAN NOT NULL,
  FOREIGN KEY (idCircuito) REFERENCES Circuito(id)
);




INSERT INTO Persona (CI, nombre, apellido, edad) VALUES
('34523125', 'Emiliano', 'Ancheta', 35),
('31243774', 'Juan', 'Sosa Dias', 42),
('54365042', 'Nicolas', 'Ferreira', 29),
('51526653', 'Luis', 'Mejia', 50),
('41234567', 'Yamandu', 'Orsi', 56), 
('52345678', 'Alvaro', 'Delgado', 55),
('63456789', 'Andres', 'Ojeda', 39),
('74567890', 'Guido', 'Manini Rios', 65),
('40000317', 'Carolina', 'Cosse', 55), 
('40000301', 'Valeria', 'Ripoll', 37),
('40000327', 'Lorena', 'Quintana', 64),
('40000323', 'Robert', 'Silva', 36),
('30000000', 'Carlos', 'Pérez', 32),
('30000001', 'Maria', 'Gonzalez', 29),
('30000002', 'Carlos', 'Castro', 43),
('30000003', 'Jorge', 'Silva', 34),
('40000000', 'Maria', 'Martinez', 52),
('40000001', 'Fernanda', 'Lopez', 61),
('40000002', 'Camila', 'Perez', 34),
('40000003', 'Ricardo', 'Diaz', 51),
('40000004', 'Maria', 'Rodriguez', 44),
('40000005', 'Jorge', 'Rodriguez', 41),
('40000006', 'José', 'Perez', 33),
('40000007', 'José', 'Silva', 30),
('40000008', 'Valentina', 'Perez', 62),
('40000009', 'Ricardo', 'Lopez', 49),
('40000010', 'Ricardo', 'Lopez', 49),
('40000011', 'Jorge', 'Perez', 57);


INSERT INTO Departamento(nombre) VALUES
('Montevideo'),
('Treinta y Tres'),
('Rocha'),
('Florida');

INSERT INTO Zona (nombre, idDepartamento) VALUES 
('Ciudad Vieja', 1),
('Barrio Sur', 2),
('La Paloma', 3),
('Florida Interior', 4);

INSERT INTO Establecimiento (nombre, ubicacion, idZona) VALUES 
('Centro de Servicios Ciudad Vieja', 'Ruta 3 220', (SELECT id FROM Zona WHERE nombre = 'Ciudad Vieja' AND idDepartamento = 1)),
('Escuela Barrio Sur', 'Avenida Italia 1234', (SELECT id FROM Zona WHERE nombre = 'Barrio Sur' AND idDepartamento = 2)),
('Liceo La Paloma', 'Calle Principal 456', (SELECT id FROM Zona WHERE nombre = 'La Paloma' AND idDepartamento = 3)),
('Polideportivo Florida Interior', 'Ruta 5 km 10', (SELECT id FROM Zona WHERE nombre = 'Florida Interior' AND idDepartamento = 4));

INSERT INTO Partido_Politico (nombre, direccion_sede, presidente, vicepresidente) VALUES 
('Partido Nacional', 'Av. 18 de Julio 1234, Montevideo', 'Luis Alberto', 'Beatriz Silva'),
('Frente Amplio', 'Colonia 1505, Montevideo', 'Fernando Pereira', 'Sofía Rodríguez'),
('Partido Colorado', 'Cuareim 1483, Montevideo', 'Julio Sanguinetti', 'Martín González'),
('Cabildo Abierto', 'Avenida Brasil 2345, Montevideo', 'Guido Manini Ríos', 'Ana Fernández');

INSERT INTO Candidato (CI, id_PartidoPolitico) VALUES
('52345678', 1),  
('40000301', 1),  
('41234567', 2), 
('40000317', 2),  
('63456789', 3),  
('40000323', 3), 
('74567890', 4),  
('40000327', 4);

INSERT INTO Agente_Policial (comisaria, CI, idEstablecimiento) VALUES 
('Comisaría 1', '30000000', 1),
('Comisaría 2', '30000001', 2),
('Comisaría 3', '30000002', 3),
('Comisaría 4', '30000003', 4);

INSERT INTO Miembro_Mesa (organismo_trabaja, CI) VALUES 
('Ministerio del Interior', '40000000'),
('Ministerio de Educación', '40000001'),
('Ministerio de Salud Pública', '40000002'),
('Intendencia', '40000003'),
('Banco República', '40000004'),
('Ministerio de Transporte', '40000005'),
('Ministerio de Vivienda', '40000006'),
('Ministerio de Desarrollo Social', '40000007'),
('Ministerio de Trabajo', '40000008'),
('Ministerio de Relaciones Exteriores', '40000009'),
('Ministerio de Defensa', '40000010'),
('Ministerio de Turismo', '40000011');

INSERT INTO Presidente_Mesa (CI) VALUES 
('40000000'),
('40000001'),
('40000002'),
('40000003');
INSERT INTO Secretario_Mesa (CI) VALUES 
('40000004'),
('40000005'),
('40000006'),
('40000007');
INSERT INTO Vocal_Mesa (CI) VALUES 
('40000008'),
('40000009'),
('40000010'),
('40000011');

INSERT INTO Circuito (nombre, es_accesible, idEstablecimiento) VALUES 
('Circuito 1', 1, 1),
('Circuito 2', 0, 2),
('Circuito 3', 1, 3),
('Circuito 4', 1, 4);

INSERT INTO Mesa (numero_mesa, idCircuito, CIPresidente, CISecretario, CIVocal) VALUES
(1000, 1, '40000000', '40000004', '40000008'),
(1001, 2, '40000001', '40000005', '40000009'),
(1002, 3, '40000002', '40000006', '40000010'),
(1003, 4, '40000003', '40000007', '40000011');


INSERT INTO Credencial_Civica (serie, numero, CI, idCircuito, yavoto) VALUES 
('JCM', '56321', '34523125', 1, 0),
('JCN', '99821', '31243774', 2, 0),
('JCT', '24461', '54365042', 3, 0),
('JCS', '02428', '51526653', 4, 0),
('JCR', '62536', '30000000', 4, 0),
('JCT', '40291', '30000001', 3, 0),
('JCE', '72881', '30000002', 2, 0),
('JCG', '71464', '30000003', 1, 0),
('JCS', '74849', '40000000', 3, 0),
('JCC', '57247', '40000001', 2, 0),
('JCL', '45838', '40000002', 1, 0),
('JCP', '36209', '40000003', 4, 0),
('JCM', '86023', '40000004', 3, 0),
('JCO', '95512', '40000005', 2, 0),
('JCR', '90584', '40000006', 1, 0),
('JCK', '87047', '40000007', 1, 0),
('JCS', '37857', '40000008', 2, 0),
('JCQ', '40996', '40000009', 3, 0),
('JCN', '13998', '40000010', 4, 0),
('JCP', '39584', '40000011', 3, 0),
('JCI', '01191', '40000317', 2, 0),
('JCC', '27674', '40000301', 2, 0),
('JCN', '54206', '40000327', 4, 0),
('JCK', '45983', '40000323', 3, 0);



INSERT INTO Rol (id, descripcion) VALUES 
(1, 'Presidente'),
(2, 'Vicepresidente'),
(3, 'Diputado'),
(4, 'Senador');

INSERT INTO Lista (numero_unico, imagen, idPartido_Politico) VALUES 
(404,'https://www.diarioarmenia.org.ar/wp-content/uploads/2022/09/partido-nacional.jpg', 1), 
(609, 'https://http2.mlstatic.com/D_NQ_NP_2X_682046-MLU31246517729_062019-F.jpg', 2),  
(606, 'https://politica.uruguay30.com/wp-content/uploads/2017/02/Partido-Colorado-bandera.jpg', 3),  
(707,'https://www.diarioarmenia.org.ar/wp-content/uploads/2023/09/cabildo-abierto.jpg', 4);  

INSERT INTO Rol_Lista_Candidato (numero_orden, idLista, idCandidato, idRol) VALUES 
(1, 404, '52345678', 1), 
(2, 404, '40000301', 2), 
(1, 609, '41234567', 1),
(2, 609, '40000317', 2), 
(1, 606, '63456789', 1), 
(2, 606, '40000323', 2),
(1, 707, '74567890', 1),
(2, 707, '40000327', 2); 


INSERT INTO EstadoVotacion (idCircuito, habilitada) VALUES
(1, false),
(2, false),
(3, false),
(4, false);