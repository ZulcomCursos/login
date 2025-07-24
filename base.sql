DROP DATABASE zulcom;
CREATE DATABASE zulcom;
use zulcom;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    domicilio TEXT,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50),
    password VARCHAR(255),
    role ENUM('Gerente', 'Administracion', 'Tecnico', 'User') DEFAULT 'User',
    copia_cedula TEXT,
    record_policial TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

