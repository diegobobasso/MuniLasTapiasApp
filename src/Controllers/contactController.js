const nodemailer = require('nodemailer');


// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // servicio de mail
    auth: {
      user: 'maildelaaplicacion@gmail.com',    // cuenta desde la cual se van a enviar los emails.
      pass: 'ontraseña de aplicación' // contraseña: en el caso de gmail, hay que habilitar verificación en 2 pasos
    }                              // y crear un conseña para nuestra aplicación. 
  });

  const contact = (req, res) => {

    let isLogged = false;

   if (req.session.user !== undefined) {
      isLogged = true;
   } 

    res.render('contact', {title:'Contacto - FunkoShop', isLogged:isLogged});
  
  }
  
  // Ruta para el formulario de contacto
const enviaCorreo = (req, res) => {
  
  const { nombre, correo, mensaje } = req.body;
  
  // Configuración del correo electrónico
  const mailOptionsProveedor = {
    from: 'maildelaaplicacion@gmail.com',
    to: 'maildelproveedor@gmail.com', // cuenta de mail a la que se envia la consulta
    subject: 'Nueva consulta',        // asunto del mail
    text: `Cliente: ${nombre}\nCorreo: ${correo}\nMensaje: ${mensaje}` // nombre, dirección de mail
  };                                                                // y mensaje con la consulta
  
  const mailOptionsCliente = {
    from: 'maildelaaplicacion@gmail.com',
    to: correo,                           // cuenta de mail del solicitante de contacto
    subject: 'Recepción de consulta',     // asunto del mail
    text: 'Gracias por tu consulta. Nos pondremos en contacto a la brevedad.' // cuerpo confirmando la
  };                                                                // recepción de la consulta
  
  // Envío de correos electrónicos
  transporter.sendMail(mailOptionsProveedor, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Correo enviado al proveedor: ' + info.response);
    }
  });
  
  transporter.sendMail(mailOptionsCliente, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Correo enviado al cliente: ' + info.response);
    }
  });
  
  // redireccion a la pagina index
  return res.redirect('/');
};
  
module.exports = {
  contact,
  enviaCorreo
}  
