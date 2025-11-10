-- 🏛️ ESQUEMA COMPLETO MUNICIPALIDAD LAS TAPIAS
-- Cubre TODOS los controladores existentes

CREATE DATABASE IF NOT EXISTS municipalidad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE municipalidad;

-- 👥 TABLAS BASE (ya existían)
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    domicilio TEXT,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('superadmin', 'admin', 'empleado') DEFAULT 'empleado',
    fecha_ingreso DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    requiere_cambio_password BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_empleado_email (email),
    INDEX idx_empleado_rol (rol)
);

CREATE TABLE vecinos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    domicilio TEXT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vecino_email (email),
    INDEX idx_vecino_dni (dni)
);

-- 📰 NOTICIAS (corregida)
CREATE TABLE noticias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(500),
    autor_id INT NOT NULL,
    categoria ENUM('general', 'infraestructura', 'servicios', 'social', 'emergencia') DEFAULT 'general',
    fecha_publicacion DATE NOT NULL,
    fecha_expiracion DATE,
    destacada BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    vistas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (autor_id) REFERENCES empleados(id),
    INDEX idx_noticias_fecha (fecha_publicacion),
    INDEX idx_noticias_categoria (categoria)
);

-- 📋 TRÁMITES (corregida para compatibilidad con backend)
CREATE TABLE tramites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    duracion_estimada VARCHAR(50),
    costo DECIMAL(10,2) DEFAULT 0.00,
    requisitos TEXT, -- ← corregido: era JSON
    horario_atencion VARCHAR(100),
    telefono_contacto VARCHAR(20),
    encargado_id INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (encargado_id) REFERENCES empleados(id),
    INDEX idx_tramites_categoria (categoria)
);

-- 📝 SUGERENCIAS (corregida)
CREATE TABLE sugerencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vecino_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria ENUM('infraestructura', 'servicios', 'seguridad', 'eventos', 'otros') DEFAULT 'otros',
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada', 'implementada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vecino_id) REFERENCES vecinos(id),
    INDEX idx_sugerencias_estado (estado)
);

-- 🏪 NEGOCIOS (NUEVA - para negocios.js)
CREATE TABLE negocios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    propietario_id INT NOT NULL,
    rubro VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    habilitado BOOLEAN DEFAULT FALSE,
    fecha_inscripcion DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (propietario_id) REFERENCES vecinos(id),
    INDEX idx_negocios_rubro (rubro),
    INDEX idx_negocios_habilitado (habilitado)
);

-- 🏘️ TERRENOS (NUEVA - para terrenos.js)
CREATE TABLE terrenos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    propietario_id INT NOT NULL,
    direccion TEXT NOT NULL,
    numero_catastral VARCHAR(100) UNIQUE,
    superficie DECIMAL(10,2),
    zona ENUM('urbana', 'rural', 'industrial') DEFAULT 'urbana',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (propietario_id) REFERENCES vecinos(id),
    INDEX idx_terrenos_zona (zona)
);

-- 📢 EVENTOS (NUEVA - para eventos.js)
CREATE TABLE eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    lugar VARCHAR(200),
    categoria ENUM('cultural', 'deportivo', 'educativo', 'social', 'oficial') DEFAULT 'cultural',
    organizador_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizador_id) REFERENCES empleados(id),
    INDEX idx_eventos_fecha (fecha_inicio),
    INDEX idx_eventos_categoria (categoria)
);

-- 🚨 DENUNCIAS (NUEVA - para denuncias.js)
CREATE TABLE denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vecino_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria ENUM('ruidos', 'limpieza', 'seguridad', 'infraestructura', 'otros') DEFAULT 'otros',
    direccion TEXT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'resuelta', 'archivada') DEFAULT 'pendiente',
    fecha_incidente DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vecino_id) REFERENCES vecinos(id),
    INDEX idx_denuncias_estado (estado),
    INDEX idx_denuncias_categoria (categoria)
);

-- 🔍 INSPECCIONES (NUEVA - para inspecciones.js)
CREATE TABLE inspecciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspector_id INT NOT NULL,
    negocio_id INT NOT NULL,
    fecha_inspeccion DATE NOT NULL,
    tipo ENUM('rutinaria', 'denuncia', 'seguridad', 'higiene') DEFAULT 'rutinaria',
    resultado ENUM('favorable', 'observado', 'clausurado') DEFAULT 'favorable',
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspector_id) REFERENCES empleados(id),
    FOREIGN KEY (negocio_id) REFERENCES negocios(id),
    INDEX idx_inspecciones_fecha (fecha_inspeccion),
    INDEX idx_inspecciones_resultado (resultado)
);

-- 📁 ARCHIVOS (NUEVA - para archivos.js)
CREATE TABLE archivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_guardado VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    tamaño INT NOT NULL,
    subido_por_id INT NOT NULL,
    entidad_tipo ENUM('empleado', 'vecino', 'negocio', 'terreno', 'tramite') NOT NULL,
    entidad_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subido_por_id) REFERENCES empleados(id),
    INDEX idx_archivos_entidad (entidad_tipo, entidad_id),
    INDEX idx_archivos_tipo (tipo)
);

-- 🔌 CONEXIONES (NUEVA - para conexiones.js)
CREATE TABLE conexiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('agua', 'luz', 'gas', 'cloacas', 'internet') NOT NULL,
    solicitante_id INT NOT NULL,
    direccion TEXT NOT NULL,
    estado ENUM('solicitada', 'en_proceso', 'conectada', 'rechazada') DEFAULT 'solicitada',
    fecha_solicitud DATE NOT NULL,
    fecha_conexion DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (solicitante_id) REFERENCES vecinos(id),
    INDEX idx_conexiones_estado (estado),
    INDEX idx_conexiones_tipo (tipo)
);

-- ❓ CONSULTAS SERVICIOS (NUEVA - para consultasServicios.js)
CREATE TABLE consultas_servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vecino_id INT NOT NULL,
    tipo_servicio ENUM('recoleccion', 'limpieza', 'alumbrado', 'arbolado', 'otros') NOT NULL,
    descripcion TEXT NOT NULL,
    direccion TEXT NOT NULL,
    estado ENUM('pendiente', 'respondida', 'derivada') DEFAULT 'pendiente',
    respuesta TEXT,
    respondido_por_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    
    FOREIGN KEY (vecino_id) REFERENCES vecinos(id),
    FOREIGN KEY (respondido_por_id) REFERENCES empleados(id),
    INDEX idx_consultas_estado (estado),
    INDEX idx_consultas_tipo (tipo_servicio)
);

-- 📊 ARTICULOS (NUEVA - para articulos.js) - Para normativas/ordenanzas
CREATE TABLE articulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    categoria ENUM('ordenanza', 'decreto', 'resolucion', 'comunicado') DEFAULT 'ordenanza',
    numero VARCHAR(50),
    fecha_emision DATE NOT NULL,
    vigente BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_articulos_categoria (categoria),
    INDEX idx_articulos_vigente (vigente)
);

-- 🔐 TABLA DE LOGS (NUEVA)
CREATE TABLE logs_acceso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    usuario_tipo ENUM('empleado', 'vecino'),
    accion VARCHAR(100) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    metodo VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    exito BOOLEAN DEFAULT TRUE,
    detalle TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_logs_usuario (usuario_id, usuario_tipo),
    INDEX idx_logs_fecha (fecha_creacion)
);

-- 👤 USUARIO SUPERADMIN INICIAL
INSERT INTO empleados (nombre, apellido, dni, email, password_hash, rol, fecha_ingreso, requiere_cambio_password) 
VALUES ('Super', 'Administrador', '00000000', 'superadmin@municipalidad.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', CURDATE(), TRUE);
