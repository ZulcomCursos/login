require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser'); 
const { dbConnectMySql } = require("./config/mysql");



const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(methodOverride('_method'));


const port = process.env.PORT || 3001; 

// Rutas principales
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// Aqui invocamos a las rutas de la API
app.use("/api", require("./routes"));

// Rutas de autenticación (vistas)
app.use("/auth", require("./routes/authViews"));

app.use("/dashboard", require("./routes/dashboard"));

if(NODE_ENV !== 'test'){
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}

dbConnectMySql();
module.exports = app;
