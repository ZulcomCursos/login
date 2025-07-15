const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/handleJwt');

// Middleware para verificar autenticación
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt; // Uso del operador opcional por si las cookies no existen
    
    if (!token) {
      return res.redirect('/auth/login');
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.redirect('/auth/login');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.redirect('/auth/login');
  }
};


module.exports = authenticate;