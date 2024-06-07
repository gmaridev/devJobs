const emailConfig = require('../config/email');
const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodeMailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth:{
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

//Utilizar templates de handlebars
transport.use('compile',hbs({
    viewEngine: {
     extname: 'handlebars',
     defaultLayout:false
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars'
}))

exports.enviar = async (opciones) => {
    const opcionesEmail = {
        from: 'devJobs <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject:opciones.subject,
        template: opciones.archivo,
        context: {
            resetURL: opciones.resetURL
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport,opcionesEmail);
}
