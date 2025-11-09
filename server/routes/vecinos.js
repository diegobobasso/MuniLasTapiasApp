/**
 * @file vecinos.js
 * @description Controlador de rutas para gestión de vecinos
 * @role Ingeniero de Sistemas - Municipalidad Las Tapias
 * @version 1.0.0
 * 
 * @strategies 
 * - Mantener compatibilidad con db.json durante desarrollo frontend
 * - Preparar estructura para migración transparente a MySQL
 * - Conservar mismos endpoints y responses para frontend
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// =============================================================================
// CONFIGURACIÓN DE DATOS - ESTRATEGIA TEMPORAL db.json
// =============================================================================

/**
 * @function loadDbData
 * @description Carga datos desde db.json (estrategia temporal)
 * @returns {Object} Datos completos de la base de datos demo
 */
const loadDbData = () => {
  try {
    const dbPath = path.join(__dirname, '..', 'db.json');
    const rawData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error cargando db.json:', error.message);
    throw new Error('Base de datos demo no disponible');
  }
};

/**
 * @function saveDbData
 * @description Guarda datos en db.json (estrategia temporal)
 * @param {Object} data - Datos a guardar
 */
const saveDbData = (data) => {
  try {
    const dbPath = path.join(__dirname, '..', 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error guardando en db.json:', error.message);
    throw new Error('Error al guardar en base de datos demo');
  }
};

// =============================================================================
// MIDDLEWARE DE VALIDACIÓN
// =============================================================================

/**
 * @middleware validateVecinoData
 * @description Valida datos básicos del vecino según estructura DB real
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next function
 */
const validateVecinoData = (req, res, next) => {
  const { dni, nombre, apellido, email, telefono, direccion } = req.body;

  // Validaciones requeridas según estructura DB real
  if (!dni || !nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: 'DNI, nombre y apellido son campos obligatorios',
      required_fields: ['dni', 'nombre', 'apellido']
    });
  }

  // Validar formato DNI (solo números, 7-8 dígitos)
  const dniRegex = /^\d{7,8}$/;
  if (!dniRegex.test(dni)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de DNI inválido. Debe contener 7 u 8 dígitos numéricos'
    });
  }

  // Validar email si está presente
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email inválido'
    });
  }

  next();
};

/**
 * @middleware validateVecinoId
 * @description Valida que el ID del vecino exista en la base de datos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const validateVecinoId = (req, res, next) => {
  const vecinoId = parseInt(req.params.id);
  const dbData = loadDbData();
  const vecino = dbData.vecinos.find(v => v.id === vecinoId);

  if (!vecino) {
    return res.status(404).json({
      success: false,
      message: `Vecino con ID ${vecinoId} no encontrado`
    });
  }

  // Adjuntar vecino al request para uso en siguientes middlewares
  req.vecino = vecino;
  next();
};

// =============================================================================
// RUTAS CRUD PARA VECINOS
// =============================================================================

/**
 * @route GET /api/vecinos
 * @description Obtiene listado completo de vecinos
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const dbData = loadDbData();
    
    res.status(200).json({
      success: true,
      count: dbData.vecinos.length,
      data: dbData.vecinos
    });

  } catch (error) {
    console.error('📛 Error en GET /vecinos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener vecinos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/vecinos/:id
 * @description Obtiene un vecino específico por ID
 * @access Public
 */
router.get('/:id', validateVecinoId, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.vecino
    });

  } catch (error) {
    console.error('📛 Error en GET /vecinos/:id:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener vecino',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/vecinos
 * @description Crea un nuevo vecino en el sistema
 * @access Public
 */
router.post('/', validateVecinoData, (req, res) => {
  try {
    const dbData = loadDbData();
    const { dni, nombre, apellido, email, telefono, direccion, id_calle, fecha_nacimiento } = req.body;

    // Verificar si ya existe vecino con mismo DNI
    const vecinoExistente = dbData.vecinos.find(v => v.dni === dni);
    if (vecinoExistente) {
      return res.status(409).json({
        success: false,
        message: `Ya existe un vecino con DNI ${dni}`,
        existing_id: vecinoExistente.id
      });
    }

    // Crear nuevo vecino con estructura compatible con DB real
    const nuevoVecino = {
      id: dbData.vecinos.length > 0 ? Math.max(...dbData.vecinos.map(v => v.id)) + 1 : 1,
      dni,
      nombre,
      apellido,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
      id_calle: id_calle || null,
      fecha_nacimiento: fecha_nacimiento || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Agregar a la base de datos demo
    dbData.vecinos.push(nuevoVecino);
    saveDbData(dbData);

    res.status(201).json({
      success: true,
      message: 'Vecino creado exitosamente',
      data: nuevoVecino
    });

  } catch (error) {
    console.error('📛 Error en POST /vecinos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear vecino',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /api/vecinos/:id
 * @description Actualiza un vecino existente
 * @access Public
 */
router.put('/:id', validateVecinoId, validateVecinoData, (req, res) => {
  try {
    const dbData = loadDbData();
    const vecinoId = parseInt(req.params.id);
    const { dni, nombre, apellido, email, telefono, direccion, id_calle, fecha_nacimiento } = req.body;

    // Verificar si DNI ya existe en otro vecino
    const dniExistente = dbData.vecinos.find(v => v.dni === dni && v.id !== vecinoId);
    if (dniExistente) {
      return res.status(409).json({
        success: false,
        message: `El DNI ${dni} ya está registrado en otro vecino`
      });
    }

    // Encontrar y actualizar vecino
    const vecinoIndex = dbData.vecinos.findIndex(v => v.id === vecinoId);
    if (vecinoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vecino no encontrado para actualización'
      });
    }

    // Actualizar datos manteniendo created_at original
    dbData.vecinos[vecinoIndex] = {
      ...dbData.vecinos[vecinoIndex],
      dni,
      nombre,
      apellido,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
      id_calle: id_calle || null,
      fecha_nacimiento: fecha_nacimiento || null,
      updated_at: new Date().toISOString()
    };

    saveDbData(dbData);

    res.status(200).json({
      success: true,
      message: 'Vecino actualizado exitosamente',
      data: dbData.vecinos[vecinoIndex]
    });

  } catch (error) {
    console.error('📛 Error en PUT /vecinos/:id:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar vecino',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route DELETE /api/vecinos/:id
 * @description Elimina un vecino del sistema (eliminación lógica)
 * @access Public
 */
router.delete('/:id', validateVecinoId, (req, res) => {
  try {
    const dbData = loadDbData();
    const vecinoId = parseInt(req.params.id);

    // Eliminar vecino (en producción sería eliminación lógica)
    dbData.vecinos = dbData.vecinos.filter(v => v.id !== vecinoId);
    saveDbData(dbData);

    res.status(200).json({
      success: true,
      message: 'Vecino eliminado exitosamente',
      deleted_id: vecinoId
    });

  } catch (error) {
    console.error('📛 Error en DELETE /vecinos/:id:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar vecino',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================================================
// RUTAS ADICIONALES - CONSULTAS ESPECÍFICAS
// =============================================================================

/**
 * @route GET /api/vecinos/dni/:dni
 * @description Busca vecino por número de DNI
 * @access Public
 */
router.get('/dni/:dni', (req, res) => {
  try {
    const dbData = loadDbData();
    const { dni } = req.params;

    const vecino = dbData.vecinos.find(v => v.dni === dni);

    if (!vecino) {
      return res.status(404).json({
        success: false,
        message: `No se encontró vecino con DNI ${dni}`
      });
    }

    res.status(200).json({
      success: true,
      data: vecino
    });

  } catch (error) {
    console.error('📛 Error en GET /vecinos/dni/:dni:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar vecino por DNI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/vecinos/search/:query
 * @description Búsqueda de vecinos por nombre o apellido
 * @access Public
 */
router.get('/search/:query', (req, res) => {
  try {
    const dbData = loadDbData();
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const vecinosFiltrados = dbData.vecinos.filter(v => 
      v.nombre.toLowerCase().includes(searchTerm) ||
      v.apellido.toLowerCase().includes(searchTerm)
    );

    res.status(200).json({
      success: true,
      count: vecinosFiltrados.length,
      search_term: query,
      data: vecinosFiltrados
    });

  } catch (error) {
    console.error('📛 Error en GET /vecinos/search/:query:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar vecinos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;