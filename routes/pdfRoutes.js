const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/docxController');

router.get('/generate/:id', pdfController.generateContract);

module.exports = router;