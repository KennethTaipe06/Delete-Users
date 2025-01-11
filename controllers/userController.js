const User = require('../models/User');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('../logger'); // Importar logger

// ...existing code...

exports.deleteUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Obtener el token de la API externa
        const token = await getExternalToken(email, password);
        const decoded = jwt.decode(token); // Decodificar el token para inspeccionarlo
        logger.info('Decoded token:', decoded); // Registrar token decodificado

        const userId = decoded.id; // Ajustar según la estructura del token

        // Eliminar el usuario
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error(error); // Registrar error
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getExternalToken = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email,
            password
        });
        return response.data.token;
    } catch (error) {
        logger.error('Failed to get external token:', error.response ? error.response.data : error.message); // Registrar error
        throw new Error('Failed to get external token');
    }
};

// ...existing code...
