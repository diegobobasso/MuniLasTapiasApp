const modelo = require('./userServices');

module.exports = {

    isLogin: (req, res, next) => {
        if(req.session.user) {
            next()
        } else {
            res.render('login', { title: 'Login - FunkoShop', message: 'Necesita Iniciar sesión...', isLogged:false });
        }
    },

    isAdmin: (req, res, next) => {
        if(req.session.user) {
            const user = modelo.getDataByEmail(req.session.user);        
            if(user.role == 'Admin') {
                next();
            } else {
                res.render('login', { title: 'Login - FunkoShop', 
                message: 'Necesita permiso de administrador para esta sección.', isLogged:true });
        }
        } else {
            res.render('login', { title: 'Login - FunkoShop', 
            message: 'Necesita Iniciar sesión de administrador', isLogged:false });
        }
    }
    
}