const express = require('express');
const User = require('../models/User');
const redisClient = require('../config/redis');
const router = express.Router();

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de autenticación
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token no válido
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  redisClient.get(id, async (err, reply) => {
    if (err) {
      console.error('Error Redis:', err);
      return res.status(500).json({ error: 'Error al verificar el token' });
    }
    
    console.log('Token from request:', token);
    console.log('Redis stored token:', reply);
    console.log('User ID:', id);

    if (!reply) {
      return res.status(401).json({ error: 'Token no encontrado en Redis para este usuario' });
    }

    // Comparar el token recibido con el almacenado en Redis
    if (reply !== token) {
      return res.status(401).json({ error: 'Token no válido para este usuario' });
    }

    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Eliminar el token de Redis después de eliminar el usuario
      redisClient.del(id, (redisErr, response) => {
        if (redisErr) {
          console.error('Error al eliminar token de Redis:', redisErr);
          return res.status(500).json({ error: 'Usuario eliminado pero hubo un error al limpiar el token' });
        }
        console.log('Token eliminado de Redis');
        res.json({ message: 'Usuario y token eliminados correctamente' });
      });

    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  });
});

module.exports = router;
