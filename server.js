import express  from "express"
import {Server as HttpServer} from "http"
import {Server as IOServer} from "socket.io"
import fs from "fs"
import {normalizar} from "./esquemaNormaizr.js"
import cookieParser from "cookie-parser"
import session from "express-session"
import mongoose from "mongoose"
import routers from "./router/router.js"
import bCrypt from "bcrypt"
import UserModels from './models/userModels.js'
import * as dotenv from 'dotenv'
dotenv.config()
import passport from "passport";
import { Strategy } from "passport-local";
import routerDesafioNuevo from './router/routerDesafioNuevo.js'
import parseArgs from "minimist"


const localStrategy = Strategy;


const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

app.use(cookieParser())
app.use(session({
	secret: 'shhhhh',
	cookie: {
	  httpOnly: false,
	  secure: false,
	  maxAge: 8000
	},
	rolling: true,
	resave: true,
	saveUninitialized: false
}));
   

//middlewares passport
app.use(passport.initialize());
app.use(passport.session());
app.use(routers)
app.use("/api", routerDesafioNuevo)

passport.use(
	"register",
	new localStrategy(
		{ passReqToCallback: true },
		async (req, username, password, done) => {
			console.log("register", username + password);
			mongoose.connect(
				`mongodb+srv://coder1:${process.env.PASSWORDATLAS}@cluster0.lubyki3.mongodb.net/?retryWrites=true&w=majority`
			);
			try {
				//----- Revisando que el usuario no existe
				UserModels.findOne({ 'username': username }, function (err, user) {

					if (err) {
					  //console.log('Error in SignUp: ' + err);
					  return done(err);
					}
			   
					if (user) {
					  //console.log('User already exists');
					  return done(null, false)
					}
					//----- Si el usuario no esta se crea en Mongo
					UserModels.create(
						{
							username,
							password: createHash(password),
							email: req.body.email,
						},
						(err, userWithId) => {
							if (err) {
								console.log(err)
								return done(err, null);
							}
							return done(null, userWithId);
						}
					);
				})
				
			} catch (e) {
				return done(e, null);
			}
		}
	)
);
passport.use(
	"login",
	new localStrategy((username, password, done) => {
		mongoose.connect(
			`mongodb+srv://coder1:${process.env.PASSWORDATLAS}@cluster0.lubyki3.mongodb.net/?retryWrites=true&w=majority`
		);
		try {
			UserModels.findOne(
				{
					username,
				
				},
				(err, user) => {
					if (err) {
						return done(err, null);
					}
					

					if (!user){
						return done(null, false)
					}

					if(!isValidPassword(user, password)){
						return done(null, false)
					}

					return done(null, user)
				}
			);
		} catch (e) {
			return done(e, null);
		}
	})
);
//serializar y deserializar
passport.serializeUser((usuario, done) => {
	console.log(usuario);
	done(null, usuario._id);
});
passport.deserializeUser((id, done) => {
	UserModels.findById(id, done);
});
function createHash(password) {
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
function isValidPassword(user, password) {
	return bCrypt.compareSync(password, user.password);
}


const mensajes = [];
async function escribir(mensaje){
	try{
		await fs.promises.writeFile("./chat.txt", JSON.stringify(mensaje, null, 2),"utf-8")
	}
	catch(error){
		console.log(error);
	}
}
async function leer(){
	try{
		const todos = await fs.promises.readFile("./chat.txt","utf-8")
		return todos.length
			? JSON.parse(todos,null,2)
			: { error: "no hay nada en archivo" }
	}
	catch(error){
		console.log(error);
	}
}

io.on("connection", (socket) => {
	console.log("se conecto un usuario");
	// --- El emit de abajo no lee la base de datos al conectarse la primera vez
	//--- Si recibe los mensajes, luego de conectarse, cuando son emitidos por alguien
	socket.emit("mensajes", (async () => {
			await leer()
		})());
	
	socket.on("mensaje",  async (data) => {
		if (mensajes.length <= 0) {
			data.id = 1
		} else {
			const id = mensajes.sort((a, b) => b.id - a.id)[0].id;
            data.id = id + 1;	
		}
		mensajes.push(data);
		let normalizado = normalizar(mensajes)
		await escribir(normalizado)
		let lecturaDeMensajes = await leer()
		io.sockets.emit("mensajes", lecturaDeMensajes);
	});
});

let optionsProcess = {default: {puerto: 8080}}
const PORT = parseArgs(process.argv, optionsProcess).puerto
const connectedServer = httpServer.listen(PORT, () => {
	console.log("servidor levantado en puerto " + PORT);
});