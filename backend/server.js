const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
  } else {
    console.log('✅ Conectado a MySQL correctamente');
  }
});

// ─── RUTAS ───────────────────────────────────────

// Registro de cliente
app.post('/api/registro', async (req, res) => {
  const { nombre, email, password, empresa } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Campos requeridos incompletos' });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO clientes (nombre, email, password, empresa) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, empresa],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY')
            return res.status(400).json({ error: 'El correo ya está registrado' });
          return res.status(500).json({ error: 'Error al registrar' });
        }
        res.json({ mensaje: 'Registro exitoso' });
      }
    );
  } catch {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Login de cliente
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Campos requeridos incompletos' });

  db.query('SELECT * FROM clientes WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });
    if (results.length === 0)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const cliente = results[0];
    const valido = await bcrypt.compare(password, cliente.password);
    if (!valido)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign(
      { id: cliente.id, nombre: cliente.nombre, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, nombre: cliente.nombre });
  });
});

// Middleware para verificar token
function verificarToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Token requerido' });
  const token = auth.split(' ')[1];
  try {
    req.cliente = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Ver proyectos del cliente
app.get('/api/mis-proyectos', verificarToken, (req, res) => {
  db.query(
    `SELECT p.*, 
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('titulo', a.titulo, 'descripcion', a.descripcion, 'fecha', a.fecha))
       FROM actualizaciones a WHERE a.proyecto_id = p.id) as actualizaciones
     FROM proyectos p WHERE p.cliente_id = ?`,
    [req.cliente.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener proyectos' });
      res.json(results);
    }
  );
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});