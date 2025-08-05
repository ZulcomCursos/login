// Carga el archivo .env personalizado si se define ENV_FILE, o usa .env por defecto
require("dotenv").config({ path: process.env.ENV_FILE || '.env' });

const express = require("express");
const cors = require("cors");
const path = require("path");
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser'); 
const { dbConnectMySql } = require("./config/mysql");

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3001; // Puerto definido por ENV o 3001

//nueva linea de practicante 1
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas principales
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// Rutas de API y vistas
app.use("/api", require("./routes"));
app.use("/auth", require("./routes/authViews"));
app.use("/dashboard", require("./routes/dashboard"));

// Rutas separadas
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const planesRoutes = require('./routes/planesRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const verRolPagosRoutes = require('./routes/verRolPagosRoutes');
const rolpagoRoutes = require('./routes/rolpagoRoutes');  
app.use('/tecnico' , tecnicoRoutes); 
app.use('/clientes', clientesRoutes);
app.use('/planes', planesRoutes);
app.use('/pdf', pdfRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/mis-roles', verRolPagosRoutes);
app.use('/rolpago', rolpagoRoutes);

// Solo iniciar el servidor si no es modo test
if(NODE_ENV !== 'test'){
    app.listen(port, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    });
}

// Conectar a la base de datos
dbConnectMySql();

module.exports = app;