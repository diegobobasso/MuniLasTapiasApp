import db from '../models/db.js';

// 📄 Listar empleados activos
export const getEmpleados = (req, res) => {
  db.query('SELECT id, nombre, email, rol, fecha_alta FROM empleados WHERE activo = TRUE', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ➕ Crear empleado
export const createEmpleado = (req, res) => {
  const { nombre, email, password_hash, rol } = req.body;
  const nuevo = {
    nombre,
    email,
    password_hash,
    rol,
    fecha_alta: new Date(),
    activo: true
  };
  db.query('INSERT INTO empleados SET ?', nuevo, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...nuevo });
  });
};

// 📴 Baja lógica
export const desactivarEmpleado = (req, res) => {
  db.query('UPDATE empleados SET activo = FALSE WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Empleado desactivado' });
  });
};
