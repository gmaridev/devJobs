const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt')

const usuariosSchema = new mongoose.Schema({
    nombre: {
      type: String,
      required: true  
    },
    email: {
        type: String,
        unique: true,
        lowerCase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
    token:String,
    expired:Date ,
    imagen:String
})

//Método para hashear las contraseñas
usuariosSchema.pre('save', async function(next){
//Si la contraseña está hasheada, no se hace nada

if(!this.isModified('password')){
    return next()
}
//Si no está hasheado
const hash = await bcrypt.hash(this.password, 10);
this.password = hash;
next()
});

//Envía alerta cuando un usuario está registrado

usuariosSchema.post('save',function(error, doc, next){
    if(error.name === 'MongoError' && error.code === 11000){
        next('Ese correo ya está registrado')

    }else{
        next(error);
    }
});

//Autenticar usuarios
usuariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password)
    }
}

module.exports = mongoose.model('Usuario',
    usuariosSchema
)