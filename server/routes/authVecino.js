const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simular autenticación de vecino
  if (email === 'vecino@example.com' && password === 'vecino123') {
    const token = jwt.sign(
      { id: 3, email, rol: 'vecino' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  }
  
  res.status(401).json({ error: 'Credenciales incorrectas' });
});

module.exports = router;
