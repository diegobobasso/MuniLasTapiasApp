const modelo = require('../utiles/itemServices'); // Importamos el controlador del modelo

// carga la vista de administrador
const adminView = async (req, res) => {
  const articulos = await modelo.getAllData(); // carga todos los productos
  res.render('admin', {         
    title: 'Administración - FunkoShop',
    articulos: articulos,
    isLogged:true
  });
};


// controlador de busqueda de administrador
const adminFind = async (req, res) => {
  let articulos = [];                         // array para guardar los resultados de articulos buscados
  let { clave } = req.body;                   // extraemos la clave del body del request
  let claveRegex = new RegExp(clave, 'i');    // creamos una expresión regular con la clave,
                                              // bandera i para ignorar mayúsculas y minúsculas
  const todos = await modelo.getAllData();    // carga todos los productos

  console.log(req.body);                       // línea de depuración
  todos.forEach((articulo) => {                 // recorremos todos los productos
    if (  
      claveRegex.test(articulo.licence_name) || // si coincide con la licencia o  el nombre
      claveRegex.test(articulo.product_name)    // del producto 
    ) {
      articulos.push(articulo);                   // lo agregamos a articulos buscados
    }
  });

  if (articulos.length == 0) {                  // si no hay resultados 
    articulos = todos;                          // copiamos todos los productos
  };
  // cargamos la vista
  res.render('admin', {
    title: 'Administración - FunkoShop',
    articulos: articulos,
    isLogged:true
  });
};

// controlador de la vista de edit
const editView = async (req, res) => {
  let { id } = req.params;                  // guardamos el id del item a buscar
  console.log(id);                    // línea de depuración

  const item = await modelo.getDataById(id); // Busca un registro por Id

  res.render('edit', { 
    title: `Edit Item #${id} - FunkoShop`, 
    item: item,
    isLogged:true 
  });
  
};

// conttrolador de actualización 
const editUpdate = async (req, res) => {
  console.log(req.params);             // línea de depuración
  console.log(req.body);                // línea de depuración

  const result = await modelo.updateData(req);   // actualiza el JSON
 
  if (result) {                                     // si tuvo exito 
    const articulos = await modelo.getAllData();    // carga los productos y 
    res.render('admin', {                           // carga la vista de administrdor
      title: 'Administracion - FunkoShop',
      articulos: articulos,
      isLogged:true
    });
  } else {                                   // en caso de error
      res.render('error', {
        title: 'Error', 
        error:'Error: no se pudo acualizar el registro' 
      });
    }
};

// controlador de vista create
const createView = (req, res) => {
  res.render('create', { 
    title: 'Crear Item',
    isLogged:true 
  });
};

// controlador para agregar un producto
const createItem = async (req, res) => {
  console.log(req.body);                         // línea de depuración
  console.log(req.files);                        // línea de depuración
const result = await modelo.postData(req);                   // agrega un producto

if (result) {
  const articulos = await modelo.getAllData();   // carga todos los productos   
  res.render('admin', {                           // carga la vista de administrdor
    title: 'Administración - FunkoShop',
    articulos: articulos,
    isLogged:true
  });
} else {                                   // en caso de error
  res.render('error', {
    title: 'Error', 
    error:'Error: no se pudo crear el registro' 
  });
}
};


// controlador de vista de confirmación de eliminación de un producto
const deleteView = async (req, res) => {
  const { id } = req.params;                      // guarda el id para buscar el producto 
  const item = await modelo.getDataById(id);      // busca el producto por id
  res.render('delete', { 
    title: `Delete Item #${id}`, 
    item: item,
    isLogged:true 
  });  // carga la vista para confirmar
};

// controlador de eliminación de un producto
const deleteItem = async (req, res) => {
  const { id } = req.body;                    // guarda el id del producto a eliminar
  console.log(id); // linea de depuración 
  
  const result = await modelo.deleteData(id); // borra el registro
  
  if (result) {                                 // si no hay error
    const articulos = await modelo.getAllData();  // busca todos los productos y 
    res.render('admin', {                          // carga la vista de administrador
      title: 'Administracion - FunkoShop',
      articulos: articulos,
      isLogged:true
    });
  } else {                                   // en caso de error
    res.render('error', {
      title: 'Error', 
      error:'Error: no se pudo borrar el registro'
    });
  }
  };

// exportamos los controladores

module.exports = {
  adminView,
  adminFind,
  editView,
  editUpdate,
  createView,
  createItem,
  deleteView,
  deleteItem,
};
