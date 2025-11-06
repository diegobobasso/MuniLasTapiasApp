-- 📘 Tablas Municipales - Modelo Relacional


-- Crear base de datos
CREATE DATABASE municipalidad CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE municipalidad;

-- Tabla vecinos
CREATE TABLE vecinos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  dni VARCHAR(20),
  cuil_cuit VARCHAR(20),
  domicilio VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(100)
);

-- Tabla terrenos
CREATE TABLE terrenos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  partida VARCHAR(20),
  cuenta VARCHAR(20),
  direccion VARCHAR(255),
  superficie_total DECIMAL(10,2),
  superficie_construida DECIMAL(10,2),
  metros_cubiertos DECIMAL(10,2),
  metros_semicubiertos DECIMAL(10,2),
  tipo ENUM('urbano', 'rural', 'comercial'),
  estado ENUM('baldio', 'construido', 'en_construccion'),
  inspeccionado BOOLEAN DEFAULT FALSE,
  planos_ruta VARCHAR(255),
  propietario_id INT,
  representante_id INT,
  FOREIGN KEY (propietario_id) REFERENCES vecinos(id),
  FOREIGN KEY (representante_id) REFERENCES vecinos(id)
);

-- Tabla negocios
CREATE TABLE negocios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  rubro VARCHAR(100),
  direccion VARCHAR(255),
  titular_id INT,
  terreno_id INT,
  inspeccionado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (titular_id) REFERENCES vecinos(id),
  FOREIGN KEY (terreno_id) REFERENCES terrenos(id)
);

-- Tabla conexiones_agua
CREATE TABLE conexiones_agua (
  id INT PRIMARY KEY AUTO_INCREMENT,
  terreno_id INT,
  estado ENUM('activa', 'inactiva', 'suspendida'),
  medidor VARCHAR(50),
  fecha_alta DATE,
  uso_especial ENUM('residencial', 'pileta', 'comercial', 'mixto'),
  FOREIGN KEY (terreno_id) REFERENCES terrenos(id)
);

-- Tabla inspecciones
CREATE TABLE inspecciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha_solicitud DATE NOT NULL,
  fecha_realizacion DATE,
  estado ENUM('pendiente', 'realizada', 'rechazada') DEFAULT 'pendiente',
  solicitante VARCHAR(100),
  institucion_ejecutora VARCHAR(100),
  inspector VARCHAR(100),
  tipo ENUM('terreno', 'negocio') NOT NULL,
  terreno_id INT,
  negocio_id INT,
  incluye_conexion_agua BOOLEAN DEFAULT FALSE,
  resultado TEXT,
  FOREIGN KEY (terreno_id) REFERENCES terrenos(id),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

-- Tabla archivos
CREATE TABLE archivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entidad_origen VARCHAR(50),   -- Ej: 'inspeccion', 'tramite', 'negocio'
  origen_id INT,                -- ID de la entidad vinculada
  nombre_archivo VARCHAR(255),
  ruta_archivo VARCHAR(255),
  tipo_mime VARCHAR(100),
  fecha_subida DATE
);

-- Tabla tasas_municipales
CREATE TABLE tasas_municipales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('inmobiliaria', 'comercial', 'agua', 'otros') NOT NULL,
  descripcion TEXT,
  monto DECIMAL(10,2),
  periodo VARCHAR(20),
  terreno_id INT,
  negocio_id INT,
  fecha_emision DATE,
  fecha_vencimiento DATE,
  estado ENUM('pendiente', 'pagada', 'vencida') DEFAULT 'pendiente',
  FOREIGN KEY (terreno_id) REFERENCES terrenos(id),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

-- Tabla eventos
CREATE TABLE eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100),
  descripcion TEXT,
  fecha DATE,
  lugar VARCHAR(255),
  tipo ENUM('comunitario', 'institucional', 'vecinal'),
  organizador VARCHAR(100),
  publico_destino TEXT
);

-- Tabla tramites
CREATE TABLE tramites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vecino_id INT,
  tipo ENUM('habilitacion', 'reclamo', 'solicitud', 'otros'),
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_resolucion DATE,
  estado ENUM('pendiente', 'en_proceso', 'resuelto', 'rechazado') DEFAULT 'pendiente',
  resultado TEXT,
  FOREIGN KEY (vecino_id) REFERENCES vecinos(id)
);

-- Tabla denuncias
CREATE TABLE denuncias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATE,
  tipo ENUM('ambiental', 'ruido', 'ocupacion', 'otros'),
  descripcion TEXT,
  denunciante VARCHAR(100),
  canal ENUM('presencial', 'web', 'teléfono'),
  estado ENUM('pendiente', 'investigando', 'resuelta', 'archivada') DEFAULT 'pendiente',
  terreno_id INT,
  negocio_id INT,
  FOREIGN KEY (terreno_id) REFERENCES terrenos(id),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

-- Tabla sugerencias
CREATE TABLE sugerencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATE NOT NULL,
  asunto VARCHAR(100),
  mensaje TEXT,
  tipo ENUM('mejora', 'reclamo', 'consulta', 'propuesta', 'otros'),
  canal ENUM('web', 'presencial', 'teléfono', 'email'),
  estado ENUM('pendiente', 'respondida', 'archivada') DEFAULT 'pendiente',
  vecino_id INT,
  respuesta TEXT,
  fecha_respuesta DATE,
  FOREIGN KEY (vecino_id) REFERENCES vecinos(id)
);

-- Tabla empleados

CREATE TABLE empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  rol ENUM('admin', 'empleado') DEFAULT 'empleado'
);
