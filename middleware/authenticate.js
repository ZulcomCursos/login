const express = require('express');
const { verifyToken } = require('../utils/handleJwt');
const { usersModel } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    
    if (!token) {
      return res.redirect('/auth/login');
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.redirect('/auth/login');
    }

    // Obtener el usuario completo de la base de datos
    let user;
    if (process.env.ENGINE_DB === "nosql") {
      user = await usersModel.findById(decoded.id).lean();
    } else {
      user = await usersModel.findByPk(decoded.id, { raw: true });
    }

    if (!user) {
      return res.redirect('/auth/login');
    }

    // Adjuntar el usuario a la solicitud
    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.redirect('/auth/login');
  }
};

module.exports = authenticate;