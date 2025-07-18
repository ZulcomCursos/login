DROP DATABASE zulcom_prueba;
CREATE DATABASE zulcom_prueba;
use zulcom_prueba;

CREATE TABLE `users` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `cedula` varchar(50) not null unique,
  `telefono` varchar(50) not null unique,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL unique,
  `username` varchar(50) DEFAULT NULL unique,  
  `password` varchar(150) DEFAULT NULL,
  `role` enum('user','tecnico','administrador','gerente') NOT NULL DEFAULT 'user',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Tabla planes
CREATE TABLE `planes` (
  `id_plan` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_plan` varchar(100) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `megas` int(11) NOT NULL,
  PRIMARY KEY (`id_plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla clientes
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `ip` text NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono1` varchar(20) NOT NULL,
  `telefono2` varchar(20) DEFAULT NULL,
  `direccion` text NOT NULL,
  `coordenadas` varchar(50) DEFAULT NULL,
  `parroquia` varchar(50) NOT NULL,
  `canton` varchar(50) NOT NULL,
  `ciudad` varchar(50) NOT NULL,
  `provincia` varchar(50) NOT NULL,
  `discapacidad` enum('si','no') NOT NULL,
  `referencias` text DEFAULT NULL,
  `fecha_contrato` date NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `id_plan` int(11) NOT NULL,
  PRIMARY KEY (`id_cliente`),
  KEY `id_plan` (`id_plan`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`id_plan`) REFERENCES `planes` (`id_plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla tickets
CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `hora` time NOT NULL,
  `tipo_trabajo` enum('reparacion','visita','instalacion','otro') NOT NULL,
  `trabajador_asignado` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` enum('pendiente','en_proceso','completado','cancelado') DEFAULT 'pendiente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_ticket` (`id_ticket`),
  KEY `id_cliente` (`id_cliente`),
  KEY `trabajador_asignado` (`trabajador_asignado`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`trabajador_asignado`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `planes` (`id_plan`, `nombre_plan`, `costo`, `megas`) VALUES
(1, 'Plan Basico', 20.00, 400),
(2, 'Plan Avanzado', 25.00, 600),
(3, 'Plan Premium', 30.00, 700),
(4, 'Plan Nuevo', 50.00, 5000);