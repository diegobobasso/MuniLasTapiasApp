const modelo = require('../utiles/itemServices'); // Importamos el controlador del modelo
const cartModel = require('../utiles/cartServices');
const itemServices = require('../utiles/itemServices');

const shopView = async (req, res) => {
  const articulos = await modelo.getAllData(); // leemos todos los productos y los guardamos en una constante
  // pagina de la tienda con todos los productos
  res.render('shop', { 
    title: 'Shop - FunkoShop', 
    articulos: articulos, 
    isLogged:true
  });
};

// controlador para filtrar las busquedas
const shopFind = async (req, res) => { 
  let articulos = [];  // array vacio para guardar la info para enviar a la vista
  let { clave } = req.body; // extraemos las claves si las hay para la busqueda
  let { orden } = req.body;
  let { precio_min } = req.body;
  let { precio_max } = req.body;
  let { ofertas } = req.body;
  let { especial } = req.body;
  let { nuevos } = req.body;
  let { favoritos } = req.body;
  let temp = [];                // array para uso temporal    
  
  let claveRegex = new RegExp(clave, 'i'); // con la clave creamos un expresión regular, 
                          // bandera i para ignorar mayúsculas y minúsculas
  
  const todos = await modelo.getAllData(); // guardamos todos los productos 

  console.log(req.body); // linea de depuracion
  todos.forEach((articulo) => { // recorremos todos los productos
    if (
      claveRegex.test(articulo.licence_name) || // RegExp.test(string) devuelve true si
      claveRegex.test(articulo.product_name)    // encuentra la coincidencia 
    ) {                               // si hay coincidencia en la licencia o nombre del producto
      articulos.push(articulo);        // agrega el item para enviarlo a la vista
    }
  });

  if (orden == 'A-Z') {                         // si orden = A-Z
    articulos.sort(function (a, b) {            // ordenmos alfabeticamente
      if (a.product_name > b.product_name) {    // usamos un cb para comparar las propiedades
        return 1;                               // del objeto dentro del array 
      }
      if (a.product_name < b.product_name) {
        return -1;
      }
      
      return 0;
    });
  }

  if (orden == 'Z-A') {                  // si orden = Z-A ordenamos en orden descendente
    articulos.sort(function (a, b) {
      if (a.product_name > b.product_name) {
        return -1;
      }
      if (a.product_name < b.product_name) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
  }

  if (orden == 'menor') {             // orden de menor a mayor precio
    articulos.sort(function (a, b) {
      if (a.product_price > b.product_price) {
        return 1;
      }
      if (a.product_price < b.product_price) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
  }

  if (orden == 'mayor') {           // orden de mayor a menor precio
    articulos.sort(function (a, b) {
      if (a.product_price > b.product_price) {
        return -1;
      }
      if (a.product_price < b.product_price) {
        return 1;
      }
      // a must be equal to b
      return 0;
    });
  }

  if (articulos.length == 0) {       // en el caso de que no hay alguna coincidencia
    articulos = todos;                // guarda todos los productos para enviarlos
  }
  if( Number(precio_min) > 0 || Number(precio_max) > 0 ) {  // si alguna de las variables es distinta de 0 
    articulos.forEach(articulo => {                         // filtramos los productos 
      if(Number(articulo.product_price) > Number(precio_min) && 
      (Number(articulo.product_price) < Number(precio_max) || Number(precio_max) === 0)) {
        temp.push(articulo);                                // guardamos el elemento que cumpla con las condiciones
      }                                                     // en el array temporal
    });
    articulos = temp;                                       // guardamos los cambios
  }
        // para el resto de los filtros deberiamos tener mas campos en products.json
  if(nuevos == 'on') {
    console.log("busca nuevos");
  }

  if(ofertas == 'on') {
    console.log("busca ofertas");
  }

  if(especial == 'on') {
    console.log("busca edición especial");
  }

  if(favoritos == 'on') {
    console.log("busca favoritos");
  }


  // carga la vista con la información filtrada
  res.render('shop', { 
    title: 'Shop - FunkoShop', 
    articulos: articulos, 
    isLogged:true 
  }); 
};

// muestra una vista detallada de un artículo y los productos relacionados
const itemView = async (req, res) => {
  let { id } = req.params; // guardamos el id que pasa por parametro en la query
  let relacionados = [];    // array para guardar los productos relacionados
  let tituloSlider;         // titulo del Slider
  console.log(id);    // linea de depuración

  const item = await modelo.getDataById(id); // Busca un registro por id
  const articulos = await modelo.getAllData(); // guarda todos los productos
  console.log(item);      // linea de depuración 
  articulos.forEach((articulo) => {     // recorremos los productos en busca de los relacionados
    if (
      articulo.licence_name == item.licence_name &&  // si coincide la licencia y  
      articulo.product_id != item.product_id          // no es el mismo producto
    ) {
      relacionados.push(articulo);                    // guardamos el producto como relacionado
    }
    tituloSlider = 'PRODUCTOS RELACIONADOS';          // título del Slider
  });

  if (relacionados.length < 1) {    // si no hay productos relacionados
    relacionados = articulos;       // guardamos todos los productos
    tituloSlider = 'MÁS PRODUCTOS COLECCIONABLES';   // título del Slider 
  }
  // carga la vista
  res.render('item', {
    title: `Item #${item.product_id} - FunkoShop`,
    item: item,
    relacionados: relacionados,
    tituloSlider: tituloSlider,
    isLogged:true
  });
};

// controlador del carrito, solo carga la vista
const cartView = async (req, res) => {
  
  const email = req.session.user;
  
  const cart = await cartModel.getDataByEmail(email);

  const productos = cart.productos;
 
  res.render('cart', { 
    title: 'Carrito - FunkoShop',
    productos:productos,
    isLogged:true
    });
};

  // controlador agrega productos al carrito
const cartItemAdd = async (req, res) => {
  
  const id = req.body.id;        // id del producto
  const email = req.session.user;   // mail del usuario
  const cantidad = req.body.cantidad;    // cantidad del producto a agregar


  console.log("id:   " + id);               // líneas de depuración 
  console.log("cantidad:   " + cantidad) ;


  const item = await itemServices.getDataById(id); // buscamos el producto
  
  const producto = {  // creamos el producto para guardar en el carrito
    item: item,
    cantidad: cantidad
  }

  const result = await cartModel.addItem(email, producto);  // agregamos el producto (result 
                                                        // para control de errores en el futuro)

  const cart = await cartModel.getDataByEmail(email); // traemos los datos actualizados

  // separamos los productos
  const productos = cart.productos; 

  // mostramos por pantalla para depuración solamente
    console.log(productos);

};

// actualiza la cantidad de un producto dentro del carrito
const cartItemUpdate = async (req, res) => {
  
  const email = req.session.user;     // mail de usuario
  const { product_sku } = req.body;   // código del producto
  const { cantidad } = req.body;      // cantidad actualizada
  
  /****lineas de depuración  ***********/
  console.log(req.body);                          
  console.log("cantidad  :     " + cantidad)
  console.log("SKU       :     " + product_sku)
  /**********************************/

  const result = await cartModel.updateCartItem(email, product_sku, cantidad); // actualizamos el carrito

  // traemos los datos actualizados
  const cart = await cartModel.getDataByEmail(email);
  // separamos los productos
  const productos = cart.productos;

  console.log(productos);    // línea de depuración  

};


// borra un producto del carrito
const cartItemDel = async (req, res) => {
  const {producto} = req.body; // producto a borrar
  const email = req.session.user; // mail de usuario

  console.log("producto =>   " , producto) // linea de depuración 

  const result = await cartModel.deleteData(email, producto); // borra el producto

  // traemos datos actualizados
  const cart = await cartModel.getDataByEmail(email);
  // separamos los productos
  const productos = cart.productos;
  // mostramos por pantalla
  console.log(productos);
  // renderizamos la vista del carrito
  res.render('cart', { 
    title: 'Carrito - FunkoShop',
    productos:productos,
    isLogged:true
  });

}

module.exports = {
  shopView,
  shopFind,
  itemView,
  cartView,
  cartItemAdd,
  cartItemDel,
  cartItemUpdate
};
