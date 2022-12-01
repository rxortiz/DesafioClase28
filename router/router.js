import { Router } from 'express'
import path from 'path'
import passport from 'passport'

const routers = new Router()

routers.get('/', (req, res) => {
    res.redirect('/home')
})
//-------- LOGIN
routers.get('/login', (req, res) => {
    const nombre = req.user?.username
    if (nombre) {
        res.redirect('/')
    } else {
        res.sendFile(path.join(process.cwd(), "/public/login.html"))
    }
})
routers.post(
    "/login",
    passport.authenticate("login", {
        successRedirect: "/home",
        failureRedirect: "/error-login",
    })
);
routers.get("/error-login", (req, res) => {
    res.sendFile(path.join(process.cwd(), "/public/error-login.html"))
});
//-------- REGISTER
routers.get("/register", (req, res) => {
    res.sendFile(path.join(process.cwd(), "/public/register.html"))
});
routers.post(
	"/register",
	passport.authenticate("register", {
		successRedirect: "/login",
		failureRedirect: "/error-register",
	})
);
routers.get("/error-register", (req, res) => {
    res.sendFile(path.join(process.cwd(), "/public/error-register.html"))
});
//-------- LOGOUT
routers.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.render(path.join(process.cwd(), '/views/logout.ejs'))
      });
})
//-------- HOME
routers.get('/home', checkAuthentication, (req, res) => {
    res.render(path.join(process.cwd(), '/views/home.ejs'), { nombre: req.user.username })
})
function checkAuthentication(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect('/login')
    }
}

export default routers