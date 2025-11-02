module.exports = {
    notFoundPage: (req, res) => {
      // carga la vista de pagina de error 404 pagina no encontrada
      res.status(404).render('Error', {title: 'Error 404', error: 'Error 404: pagina no encontrada...'});
    }
  }