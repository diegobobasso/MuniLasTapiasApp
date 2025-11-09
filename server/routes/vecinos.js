/**
 * 👨‍👩‍👧‍👦 CONTROLADOR DE VECINOS - VERSIÓN BASE DE DATOS REAL
 * 
 * Este controlador maneja todas las operaciones CRUD para vecinos del municipio
 * utilizando conexión real a base de datos MySQL con consultas preparadas
 * y encriptación segura de contraseñas.
 * 
 * Endpoints disponibles:
 * - GET    /api/vecinos              - Listar todos los vecinos
 * - GET    /api/vecinos/:id          - Obtener vecino específico  
 * - POST   /api/vecinos              - Crear nuevo vecino
 * - PUT    /api/vecinos/:id          - Actualizar vecino
 * - PUT    /api/vecinos/:id/restaurar-clave - Restaurar contraseña
 * 
 * Seguridad implementada:
 * - Autenticación JWT requerida en todas las rutas
 * - Autorización por roles (admin y empleados pueden crear)
 * - Validación robusta de datos de entrada
 * - Encriptación bcrypt para contraseñas
 * - Consultas preparadas para prevenir SQL injection
 * - Verificación de unicidad de DNI y email
 */

const express = require('express');
const router = express.Router();
const { verificarToken, autorizarRoles } = require('../middleware/authMiddleware');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { ejecutarConsulta } = require('../config/databaseConnection');
const { encriptarPassword, validarFortalezaPassword } = require('../middleware/bcrypt');

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA DATOS DE VECINO
 * 
 * Realiza validación completa de los datos del vecino antes de procesarlos
 * incluyendo formato de email, DNI válido, y fortaleza de contraseña.
 * 
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express  
 * @param {Function} next - Next middleware function
 */
const validarVecino = (req, res, next) => {
  const { nombre, apellido, dni, domicilio, telefono, email, password } = req.body;
  const errores = [];

  // Validación de nombre (mínimo 2 caracteres)
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validación de apellido (mínimo 2 caracteres)
  if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }

  // Validación de DNI (7 u 8 dígitos numéricos)
  const dniRegex = /^\d{7,8}$/;
  if (!dni || !dniRegex.test(dni.toString())) {
    errores.push('El DNI debe tener 7 u 8 dígitos numéricos');
  }

  // Validación de domicilio (mínimo 5 caracteres)
  if (!domicilio || typeof domicilio !== 'string' || domicilio.trim().length < 5) {
    errores.push('El domicilio debe tener al menos 5 caracteres');
  }

  // Validación de teléfono (opcional, pero si existe debe ser válido)
  if (telefono && !/^\d{6,15}$/.test(telefono.toString().replace(/\D/g, ''))) {
    errores.push('El teléfono debe tener entre 6 y 15 dígitos');
  }

  // Validación de email (formato válido requerido)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El email debe tener un formato válido');
  }

  // Validación de password (solo para creación - POST requests)
  if (req.method === 'POST') {
    const validacionPassword = validarFortalezaPassword(password);
    if (!validacionPassword.valida) {
      errores.push(...validacionPassword.errores);
    }
  }

  // Si hay errores, lanzar excepción de validación estructurada
  if (errores.length > 0) {
    throw new ValidationError('Errores de validación en datos de vecino', errores);
  }

  // Limpieza y normalización de datos para consistencia
  req.body.nombre = nombre.trim();
  req.body.apellido = apellido.trim();
  req.body.domicilio = domicilio.trim();
  req.body.email = email.toLowerCase().trim();
  
  // Normalización de teléfono (remover caracteres no numéricos)
  if (telefono) {
    req.body.telefono = telefono.toString().replace(/\D/g, '');
  }

  next();
};

/**
 * ✅ MIDDLEWARE DE VALIDACIÓN PARA CAMBIO DE CONTRASEÑA DE VECINO
 * 
 * Valida que la nueva contraseña cumpla con los requisitos de seguridad
 * antes de permitir el cambio en la base de datos.
 * 
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @param {Function} next - Next middleware function
 */
const validarCambioPasswordVecino = (req, res, next) => {
  const { nuevaClave } = req.body;

  // Validación de presencia de nueva contraseña
  if (!nuevaClave) {
    throw new ValidationError('La nueva contraseña es requerida');
  }

  // Validación de fortaleza de la nueva contraseña
  const validacion = validarFortalezaPassword(nuevaClave);
  if (!validacion.valida) {
    throw new ValidationError('La nueva contraseña no cumple con los requisitos de seguridad', validacion.errores);
  }

  next();
};

/**
 * 📋 ENDPOINT: LISTAR TODOS LOS VECINOS
 * 
 * Obtiene la lista completa de vecinos activos de la base de datos
 * con información básica para display en interfaces administrativas.
 * 
 * @route GET /api/vecinos
 * @access Privado (Requiere autenticación JWT)
 * @role Admin, Empleado
 */
router.get('/', verificarToken, asyncHandler(async (req, res) => {
  console.log('✅ GET /api/vecinos - Usuario:', req.user.email);
  
  // Consulta SQL optimizada para obtener vecinos activos
  const sql = `
    SELECT 
      id, nombre, apellido, dni, email, telefono, domicilio,
      fecha_registro, activo, fecha_creacion
    FROM vecinos 
    WHERE activo = TRUE
    ORDER BY apellido, nombre
  `;
  
  // Ejecutar consulta preparada
  const vecinos = await ejecutarConsulta(sql);
  
  // Respuesta estructurada con metadata
  res.json({
    success: true,
    message: 'Lista de vecinos obtenida exitosamente',
    data: {
      vecinos: vecinos
    },
    metadata: {
      total: vecinos.length,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * 👤 ENDPOINT: OBTENER VECINO ESPECÍFICO
 * 
 * Obtiene la información detallada de un vecino específico por su ID
 * incluyendo todos sus datos de contacto e información de registro.
 * 
 * @route GET /api/vecinos/:id
 * @access Privado (Requiere autenticación JWT)
 * @role Admin, Empleado
 */
router.get('/:id', verificarToken, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  console.log(`✅ GET /api/vecinos/${vecinoId} - Usuario:`, req.user.email);

  // Validación robusta del ID (debe ser número positivo)
  if (isNaN(vecinoId) || vecinoId <= 0) {
    throw new ValidationError('ID de vecino inválido. Debe ser un número positivo.');
  }

  // Consulta SQL para obtener vecino específico
  const sql = `
    SELECT 
      id, nombre, apellido, dni, email, telefono, domicilio,
      fecha_registro, activo, fecha_creacion, fecha_actualizacion
    FROM vecinos 
    WHERE id = ? AND activo = TRUE
  `;
  
  // Ejecutar consulta preparada con parámetros
  const vecinos = await ejecutarConsulta(sql, [vecinoId]);
  
  // Verificar si se encontró el vecino
  if (vecinos.length === 0) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado o inactivo`);
  }

  // Respuesta exitosa con datos del vecino
  res.json({
    success: true,
    message: 'Vecino obtenido exitosamente',
    data: {
      vecino: vecinos[0]
    }
  });
}));

/**
 * ➕ ENDPOINT: CREAR NUEVO VECINO
 * 
 * Registra un nuevo vecino en el sistema municipal con validación completa
 * de datos y encriptación segura de la contraseña.
 * 
 * @route POST /api/vecinos
 * @access Privado (Requiere rol de admin o empleado)
 * @role Admin, Empleado
 */
router.post('/', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, asyncHandler(async (req, res) => {
  console.log('✅ POST /api/vecinos - Datos validados:', req.body);
  
  // Extraer y desestructurar datos validados del request
  const { nombre, apellido, dni, domicilio, telefono, email, password } = req.body;
  
  // 🔍 VERIFICACIÓN DE UNICIDAD: Email
  const sqlVerificarEmail = 'SELECT id FROM vecinos WHERE email = ?';
  const vecinosConEmail = await ejecutarConsulta(sqlVerificarEmail, [email]);
  
  if (vecinosConEmail.length > 0) {
    throw new ValidationError('Ya existe un vecino registrado con ese email');
  }

  // 🔍 VERIFICACIÓN DE UNICIDAD: DNI
  const sqlVerificarDNI = 'SELECT id FROM vecinos WHERE dni = ?';
  const vecinosConDNI = await ejecutarConsulta(sqlVerificarDNI, [dni]);
  
  if (vecinosConDNI.length > 0) {
    throw new ValidationError('Ya existe un vecino registrado con ese DNI');
  }

  // 🔐 ENCRIPTACIÓN SEGURA DE CONTRASEÑA
  const passwordHash = await encriptarPassword(password);
  
  // 📝 CONSULTA SQL PARA INSERTAR NUEVO VECINO
  const sqlInsert = `
    INSERT INTO vecinos (
      nombre, apellido, dni, domicilio, telefono, email, 
      password_hash, fecha_registro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
  `;
  
  // Parámetros para la consulta preparada
  const parametros = [
    nombre, apellido, dni, domicilio, 
    telefono || null, email, passwordHash
  ];
  
  // Ejecutar inserción en la base de datos
  const resultado = await ejecutarConsulta(sqlInsert, parametros);
  
  // 🔍 OBTENER EL VECINO RECIÉN CREADO (sin información sensible)
  const sqlObtenerNuevo = `
    SELECT 
      id, nombre, apellido, dni, email, telefono, domicilio,
      fecha_registro, activo, fecha_creacion
    FROM vecinos 
    WHERE id = ?
  `;
  
  const nuevoVecino = await ejecutarConsulta(sqlObtenerNuevo, [resultado.insertId]);

  // 📨 RESPUESTA EXITOSA CON DATOS DEL NUEVO VECINO
  res.status(201).json({
    success: true,
    message: 'Vecino creado exitosamente',
    data: {
      vecino: nuevoVecino[0]
    },
    metadata: {
      timestamp: new Date().toISOString(),
      vecinoId: resultado.insertId,
      registradoPor: req.user.email
    }
  });
}));

/**
 * 🔄 ENDPOINT: RESTAURAR CONTRASEÑA DE VECINO
 * 
 * Permite a administradores o empleados restaurar la contraseña de un vecino
 * estableciendo una nueva contraseña segura.
 * 
 * @route PUT /api/vecinos/:id/restaurar-clave
 * @access Privado (Requiere rol de admin o empleado)
 * @role Admin, Empleado
 */
router.put('/:id/restaurar-clave', verificarToken, autorizarRoles('admin', 'empleado'), validarCambioPasswordVecino, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  const { nuevaClave } = req.body;
  
  console.log('✅ PUT /api/vecinos/restaurar-clave - ID:', vecinoId);
  
  // Validación del ID del vecino
  if (isNaN(vecinoId) || vecinoId <= 0) {
    throw new ValidationError('ID de vecino inválido');
  }

  // Verificar que el vecino existe y está activo
  const sqlVerificar = 'SELECT id FROM vecinos WHERE id = ? AND activo = TRUE';
  const vecinos = await ejecutarConsulta(sqlVerificar, [vecinoId]);
  
  if (vecinos.length === 0) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado o inactivo`);
  }

  // 🔐 ENCRIPTAR NUEVA CONTRASEÑA
  const nuevaPasswordHash = await encriptarPassword(nuevaClave);
  
  // 📝 ACTUALIZAR CONTRASEÑA EN BASE DE DATOS
  const sqlActualizar = `
    UPDATE vecinos 
    SET password_hash = ?, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  await ejecutarConsulta(sqlActualizar, [nuevaPasswordHash, vecinoId]);

  // 📨 RESPUESTA EXITOSA
  res.json({
    success: true,
    message: 'Contraseña de vecino restaurada exitosamente',
    data: {
      vecinoId: vecinoId,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

/**
 * ✏️ ENDPOINT: ACTUALIZAR INFORMACIÓN DE VECINO
 * 
 * Permite actualizar la información de contacto de un vecino existente
 * sin modificar datos sensibles como DNI o contraseña.
 * 
 * @route PUT /api/vecinos/:id
 * @access Privado (Requiere rol de admin o empleado)
 * @role Admin, Empleado
 */
router.put('/:id', verificarToken, autorizarRoles('admin', 'empleado'), validarVecino, asyncHandler(async (req, res) => {
  const vecinoId = parseInt(req.params.id);
  const { nombre, apellido, domicilio, telefono } = req.body;
  
  console.log(`✅ PUT /api/vecinos/${vecinoId} - Datos:`, req.body);

  // Validación del ID del vecino
  if (isNaN(vecinoId) || vecinoId <= 0) {
    throw new ValidationError('ID de vecino inválido');
  }

  // Verificar que el vecino existe y está activo
  const sqlVerificar = 'SELECT id FROM vecinos WHERE id = ? AND activo = TRUE';
  const vecinos = await ejecutarConsulta(sqlVerificar, [vecinoId]);
  
  if (vecinos.length === 0) {
    throw new NotFoundError(`Vecino con ID ${vecinoId} no encontrado o inactivo`);
  }

  // 📝 CONSULTA SQL PARA ACTUALIZAR VECINO
  const sqlActualizar = `
    UPDATE vecinos 
    SET nombre = ?, apellido = ?, domicilio = ?, telefono = ?, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  await ejecutarConsulta(sqlActualizar, [nombre, apellido, domicilio, telefono, vecinoId]);

  // 🔍 OBTENER EL VECINO ACTUALIZADO
  const sqlObtener = `
    SELECT 
      id, nombre, apellido, dni, email, telefono, domicilio,
      fecha_registro, activo, fecha_creacion, fecha_actualizacion
    FROM vecinos 
    WHERE id = ?
  `;
  
  const vecinoActualizado = await ejecutarConsulta(sqlObtener, [vecinoId]);

  // 📨 RESPUESTA EXITOSA CON DATOS ACTUALIZADOS
  res.json({
    success: true,
    message: 'Vecino actualizado exitosamente',
    data: {
      vecino: vecinoActualizado[0],
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: req.user.email
    }
  });
}));

module.exports = router;