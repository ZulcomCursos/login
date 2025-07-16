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