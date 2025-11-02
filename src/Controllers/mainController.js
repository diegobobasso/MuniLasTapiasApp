const modeloItem = require('../utiles/itemServices'); // Importamos el controlador del modelo
const modeloIndex = require('../utiles/indexServices'); // Importamos el controlador del modelo

// controlador de vista raíz, index
const mainController = async (req, res) => {

   let isLogged = false;

   if (req.session.user !== undefined) {
      isLogged = true;
   } 

   const relacionados = await modeloItem.getAllData(); // busca articulos.
   const novedades = await modeloIndex.getAllData(); // busca articulos.
   
   res.render('index', {
      title: 'Home - FunkoShop', 
      relacionados:relacionados, 
      novedades:novedades,
      tituloSlider:'ULTIMOS LANZAMIENTOS',
      isLogged:isLogged
   });
}

const aboutController = (req, res) => {
   res.send("Estas en la página de acerca de");
}
const faqsController = (req, res) => {
   res.send("Estas en la página de faqs");
}


module.exports = {
   mainController,  
   aboutController, 
   faqsController
};

