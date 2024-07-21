CREATE DATABASE eym;
USE eym;

CREATE TABLE Usuarios (
    Usuario VARCHAR(15) NOT NULL,
    Contraseña VARCHAR(15) NOT NULL,
    Tipo VARCHAR(15) NOT NULL,
    PRIMARY KEY (Usuario)
);

CREATE TABLE Ubicaciones (
    Id INT NOT NULL AUTO_INCREMENT,
    Usuario VARCHAR(15) NOT NULL,
    Fecha DATETIME NOT NULL,
    Latitud DECIMAL(9,6) NOT NULL,
    Longitud DECIMAL(9,6) NOT NULL,
    PRIMARY KEY (Id),
    FOREIGN KEY (Usuario) REFERENCES Usuarios(Usuario)
);

INSERT INTO Usuarios VALUES
('PNBOG01', 'PNBOG01', 'Empleado'),
('PNBOG02', 'PNBOG02', 'Empleado'),
('PNBOG03', 'PNBOG03', 'Empleado'),
('PNBOG04', 'PNBOG04', 'Empleado'),
('PNBOG05', 'PNBOG05', 'Empleado'),
('PNBOG06', 'PNBOG06', 'Empleado'),
('PNBOG07', 'PNBOG07', 'Empleado'),
('LDRBOG01', 'LDRBOG01', 'Lider'),
('LDRBOG02', 'LDRBOG02', 'Lider'),
('LDRBOG03', 'LDRBOG03', 'Lider');