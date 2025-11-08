const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ CORREGIDO: Endpoints con nombres originales

// POST /api/auth/login-inicial
router.post('/login-inicial', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login inicial attempt:', { email });
    
    // Verificar credenciales iniciales (superadmin por defecto)
    if (email === 'superadmin@municipalidad.com' && password === 'Admin123!') {
      // En una implementación real, verificaríamos en la base de datos
      const requiereCambio = true; // Siempre true en primera vez
      
      if (requiereCambio) {
        console.log('🔄 Login inicial: requiere cambio de password');
        return res.status(403).json({ 
          error: 'Debe cambiar su contraseña inicial',
          requiereCambioPassword: true
        });
      }
      
      // Este caso no debería ocurrir en el flujo inicial
      const token = jwt.sign(
        { 
          id: 1, 
          email: email, 
          rol: 'superadmin',
          requiereCambioPassword: false 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      return res.json({ token });
    }
    
    console.log('❌ Credenciales iniciales incorrectas');
    res.status(404).json({ error: 'Credenciales iniciales incorrectas' });
  } catch (error) {
    console.error('💥 Error en login-inicial:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/cambiar-password-inicial
router.post('/cambiar-password-inicial', async (req, res) => {
  try {
    const { email, nuevaPassword } = req.body;
    console.log('🔄 Cambio password inicial:', { email });
    
    // Validar nueva contraseña
    if (!nuevaPassword || nuevaPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    
    // Simular actualización en base de datos
    console.log(`✅ Contraseña cambiada exitosamente para: ${email}`);
    
    res.json({ 
      mensaje: 'Contraseña cambiada exitosamente',
      requiereCambioPassword: false 
    });
  } catch (error) {
    console.error('💥 Error en cambiar-password-inicial:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login normal attempt:', { email });
    
    // Simulación de verificación en base de datos
    // Admin credentials después del cambio
    if (email === 'admin@municipalidad.com' && password === 'NuevaPassword123!') {
      const token = jwt.sign(
        { 
          id: 1, 
          email: email, 
          rol: 'admin',
          requiereCambioPassword: false 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log(`✅ Login exitoso: ${email}`);
      
      return res.json({ token });
    }
    
    // Empleado credentials
    if (email === 'empleado@municipalidad.com' && password === 'Empleado123!') {
      const token = jwt.sign(
        { 
          id: 2, 
          email: email, 
          rol: 'empleado',
          requiereCambioPassword: false 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      console.log(`✅ Login exitoso: ${email}`);
      return res.json({ token });
    }
    
    console.log('❌ Credenciales incorrectas para:', email);
    res.status(401).json({ error: 'Credenciales incorrectas' });
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;