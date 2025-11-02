const fs = require('fs'); // requerimos fs
const bcryptjs = require('bcryptjs');

const dataPath = './data/users.json'; // definimos ruta al archivo de datos JSON

// función de lectura de archivo JSON
const readData = () => {
  try { // intentamos leer el archivo productos.json
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // transformamos a formato JSON la 
                                                          // leida con fs.readFileSync (lectura sincrónica)
  } catch (error) { // si hay error lo mostramos y retornamos un array vacío
    console.error('Error al leer el archivo JSON:', error.message);
    return [];
  }
};

// función de escritura de archivo JSON 
const writeData = (data) => { // data: información a guardar en el archivo
  try { // intentamos escribir el archivo productos.json
    const jsonData = JSON.stringify(data, null, 2); // transformamos la información recibida
    fs.writeFileSync(dataPath, jsonData, 'utf-8');  // escribimos la información en el archivo 
    console.log('Archivo JSON actualizado correctamente.'); // si no hay error mostramos el mensaje 
    return 1;  // devuelve 1 en exito    
  } catch (error) {  // si hay error mostramos el mensaje 
    console.error('Error al escribir en el archivo JSON:', error.message);
    return -1; // devuelve -1 en error
  }
};

module.exports = { // exportamos las funciones

  // devuelve todos los productos
  getAllData: () => { 
    const data = readData(); // lee la info
    return data;             // la retorna
  },


  // devuelve un usuario, lo busca por email
  getDataByEmail: (email) => {
    const data = readData(); // lee la info

    let user = {}; // creamos un objeto vacío 
    
    data.forEach(index => { // recorremos la info leída
      if(index.email === email) { // si coincide el email
        user = index;             // lo guardamos en el objeto creado antes
      }
    });
    console.log(user);    // linea para depuración
    return user;         // devolvemos el usuario si se encontró, sino lo devuelve vacío
  
  },
  

  // agrega un usuario
  postData: (req) => { // recibe el require completo
    
    const data = readData(); // lee la info

    const {password} = req.body;
    // creamos un objeto y le agregamos parte de la información pasada por parametro
    const newUser = {    
        id: data.length + 1,                // el id es = al total de elementos ( objetos en el array[]) + 1     
        name: req.body.name,
        lastname:req.body.lastname,
        email: req.body.email,
        password: bcryptjs.hashSync(password.toString(), 8),
        role: "user"
      };

    data.push(newUser); // agregamos el nuevo usuario 
    const result = writeData(data);        // guarda la información
    if(result) console.log( 'Datos de usuario agregados correctamente :   ', newUser ); // muestra un mensaje y el usuario agregado
    return result;
  },

  // actualiza un usuario
  updateData: (req) => {
    
    const data = readData();  // lee toda la información de users
    const id = req.body.id; // guardamos el id a actualizar
    let user = {};    // objeto para guardar la info a actualizar
    
    data.forEach(index => { // recorremos data en busca del usurario a actualizar
      if(index.id === parseInt(id)) { // si lo encontramos
        user = index;   // guardamos la información
      }
    });

    // creamos un objeto y guardamos la información 
    const updatedData = {
      id: parseInt(id),        
      name: req.body.name,
      lastname:req.body.lastname,
      email: req.body.email,
      password: bcryptjs.hashSync(password.toString(), 8),
      role: "user"
    };

    
    
    if (user != {}) {
      data[parseInt(user.id)-1] = updatedData; // actualizamos el usuario
      return writeData(data);    // guardamos la información actualizada y devolvemos el resultado
    } else {
      console.log('ID no encontrado');
      return -1;
    }
  },

  // borra un usuario
  deleteData: (id) => {
    const data = readData(); // traemos la información de users

    let newData = []; // creamos un array vacio para guardar la información actualizada
    data.forEach(index => { // recorremos en busca del id 
      if(index.id !== parseInt(id)) {   // si el no coincide con
        index.id = newData.length + 1;  // con el usuaio que queremos eliminar, lo
        newData.push(index);            // agregamos al array con data actualizada
      }
    });

    if (newData.length < data.length) {   // si el tamaño de newData es menor a data filtramos correctamente la info
      console.log('ID encontrado');
      return writeData(newData);    // guardamos la información actualizada y devolvemos el resultado
    } else {
      console.log('ID no encontrado');
      return -1;
    }
  }
};

