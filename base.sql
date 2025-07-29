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

-- 1. Tabla PLANES
CREATE TABLE planes (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    nombre_plan VARCHAR(100) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    megas VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla CLIENTES
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(50) UNIQUE NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono1 VARCHAR(20) UNIQUE NOT NULL,
    telefono2 VARCHAR(20),
    direccion TEXT,
    coordenadas VARCHAR(255),
    parroquia VARCHAR(100),
    canton VARCHAR(100),
    ciudad VARCHAR(100),
    provincia VARCHAR(100),
    discapacidad ENUM('si','no') NOT NULL,
    referencias TEXT,
    fecha_contrato DATE,
    id_plan INT,
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plan) REFERENCES planes(id_plan)
);

-- 3. Tabla TICKETS
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ticket VARCHAR(50) UNIQUE NOT NULL, -- Se genera en formato año-mes-dia-0001
    tipo_problema VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado ENUM('abierto','cerrado','completado') DEFAULT 'abierto',
    id_cliente INT NOT NULL,
    id_tecnico INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_solucion DATE,
    hora_solucion TIME,
    solucion TEXT DEFAULT 'Sin solución',
    horaVisita TIME,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tecnico) REFERENCES users(id)
);

CREATE TABLE horas_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actividades TEXT,
    registrado_por INT,
    aceptado_por INT,
    horas INT,
    estado ENUM('aceptadas', 'pendientes', 'negadas'),
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registrado_por) REFERENCES users(id),
    FOREIGN KEY (aceptado_por) REFERENCES users(id)
);

CREATE TABLE roles_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajador INT,
    horas_extra INT,
    periodo VARCHAR(20), -- formato: mes-año
    salario DECIMAL(10,2),
    decimos DECIMAL(10,2),
    aporte_iess DECIMAL(10,2),
    bonos DECIMAL(10,2),
    descuentos DECIMAL(10,2),
    total DECIMAL(10,2),
    estado ENUM('generado', 'atraso_pago', 'finalizado'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_trabajador) REFERENCES users(id)
);
