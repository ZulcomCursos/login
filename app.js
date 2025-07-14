require("dotenv").config();
const express= require("express");
const cors = require("cors");
//const swaggerUI = require("swagger-ui-express");
//const morganBody = require("morgan-body");
//const openApiConfigration = require ("./docs/swagger")
//const loggerStream = require("./utils/handleLogger");
//const dbConnectNoSql = require('./config/mongo');
const { dbConnectMySql } = require("./config/mysql");
const app = express();

const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json());
//app.use(express.static("storage"));

//morganBody(app,{
//    noColors: true,
 //   stream: loggerStream,
 //   skip: function(req,res){
 //       return res.statusCode <400 //todo lo que sea errores lo envia al canal
 //   },
//});

const port= process.env.PORT || 3000;
/**
 * Definir rutas de documentacion
 */

//app.use('/documentation', 
//    swaggerUI.serve, 
//   swaggerUI.setup(openApiConfigration));

/**
 * Aqui invocamos a las rutas
 */
app.use("/api",require("./routes"));

if(NODE_ENV !== 'test'){
    app.listen(port,() =>{
        console.log(port)
    });
} 



dbConnectMySql();
module.exports = app;