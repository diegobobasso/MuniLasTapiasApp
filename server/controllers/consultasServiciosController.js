import db from '../models/db.js';

// Consulta por CIUL o CUIT
export const consultarServicios = (req, res) => {
  const { identificador } = req.query;

  if (!identificador || identificador.length < 8) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  const sql = `
    SELECT id, tipo, estado, ultimo_pago, deuda,
           CASE WHEN estado = 'activo' AND deuda > 0 THEN true ELSE false END AS pagable
    FROM servicios
    WHERE ciul = ? OR cuit = ?
  `;

  db.query(sql, [identificador, identificador], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Consulta por ID (para vista de pago)
export const consultarServicioPorId = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM servicios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(results[0]);
  });
};
