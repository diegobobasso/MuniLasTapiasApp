-- insertar datos de pruea

USE municipalidad;

-- Vecinos
INSERT INTO vecinos (nombre, apellido, dni, cuil_cuit, domicilio, telefono, email) VALUES
('Carlos', 'Gómez', '30123456', '20-30123456-3', 'Calle 1', '3511234567', 'carlos@example.com'),
('Lucía', 'Martínez', '28987654', '27-28987654-9', 'Calle 2', '3517654321', 'lucia@example.com');

-- Terrenos
INSERT INTO terrenos (partida, cuenta, direccion, superficie_total, superficie_construida, metros_cubiertos, metros_semicubiertos, tipo, estado, inspeccionado, planos_ruta, propietario_id, representante_id) VALUES
('123456', 'A001', 'Av. Principal 100', 500.00, 300.00, 250.00, 50.00, 'urbano', 'construido', TRUE, '/uploads/planos/123456.pdf', 1, 2),
('789012', 'A002', 'Ruta 5 Km 12', 1000.00, 0.00, 0.00, 0.00, 'rural', 'baldio', FALSE, NULL, 2, NULL);

-- Negocios
INSERT INTO negocios (nombre, rubro, direccion, titular_id, terreno_id, inspeccionado) VALUES
('Panadería Las Tapias', 'Alimentos', 'Av. Principal 100', 1, 1, TRUE),
('Ferretería El Tornillo', 'Ferretería', 'Ruta 5 Km 12', 2, 2, FALSE);

-- Conexiones de agua
INSERT INTO conexiones_agua (terreno_id, estado, medidor, fecha_alta, uso_especial) VALUES
(1, 'activa', 'MED123', '2023-01-15', 'residencial'),
(2, 'inactiva', 'MED456', '2022-06-10', 'comercial');

-- Inspecciones
INSERT INTO inspecciones (fecha_solicitud, fecha_realizacion, estado, solicitante, institucion_ejecutora, inspector, tipo, terreno_id, negocio_id, incluye_conexion_agua, resultado) VALUES
('2025-10-01', '2025-10-05', 'realizada', 'Municipalidad', 'Municipalidad de Las Tapias', 'Inspector López', 'terreno', 1, NULL, TRUE, 'Terreno en condiciones, conexión activa.'),
('2025-10-10', NULL, 'pendiente', 'Denuncia vecinal', 'ERSEP', 'Inspector Ruiz', 'negocio', NULL, 2, FALSE, NULL);

-- Tasas municipales
INSERT INTO tasas_municipales (tipo, descripcion, monto, periodo, terreno_id, negocio_id, fecha_emision, fecha_vencimiento, estado) VALUES
('inmobiliaria', 'Tasa anual 2025', 12000.00, '2025', 1, NULL, '2025-01-01', '2025-03-31', 'pagada'),
('comercial', 'Tasa habilitación 2025', 3500.00, '2025', NULL, 1, '2025-02-01', '2025-04-01', 'pendiente');

-- Eventos
INSERT INTO eventos (titulo, descripcion, fecha, lugar, tipo, organizador, publico_destino) VALUES
('Fiesta del Pueblo', 'Evento comunitario anual con música y feria', '2025-11-15', 'Plaza Central', 'comunitario', 'Municipalidad de Las Tapias', 'Toda la comunidad');

-- Trámites
INSERT INTO tramites (vecino_id, tipo, descripcion, fecha_inicio, fecha_resolucion, estado, resultado) VALUES
(1, 'habilitacion', 'Solicitud de habilitación comercial', '2025-09-01', '2025-09-15', 'resuelto', 'Habilitación otorgada'),
(2, 'reclamo', 'Reclamo por falta de recolección', '2025-10-05', NULL, 'en_proceso', NULL);

-- Denuncias
INSERT INTO denuncias (fecha, tipo, descripcion, denunciante, canal, estado, terreno_id, negocio_id) VALUES
('2025-10-08', 'ruido', 'Ruidos molestos en horario nocturno', 'Vecino anónimo', 'web', 'investigando', NULL, 2);

-- Sugerencias
INSERT INTO sugerencias (fecha, asunto, mensaje, tipo, canal, estado, vecino_id, respuesta, fecha_respuesta) VALUES
('2025-10-12', 'Mejoras en iluminación', 'Solicito más luminarias en Calle 2', 'mejora', 'web', 'respondida', 2, 'Se programó instalación para noviembre.', '2025-10-20');
