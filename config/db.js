//Conexión a la base de datos
const mongoose = require('mongoose');
require('dotenv').config({path:'variables.env'});

// mongoose.connect(process.env.DATABASE, {useNewUrlParser:true});
mongoose.connect(process.env.DATABASE);

mongoose.connection.on('error', (error)=>{
    console.log(error);
})


//Importar los modelos
require('../models/Vacantes')
require('../models/Usuarios')