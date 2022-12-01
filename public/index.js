const socket = io.connect();

const input = document.querySelector("input");

document.getElementById("formChat").addEventListener("submit",(e) =>{
	e.preventDefault()
	let email = document.querySelector("#formChat > #email").value
	let nombre = document.querySelector("#formChat > #nombre").value
	let apellido = document.querySelector("#formChat > #apellido").value
	let edad = document.querySelector("#formChat > #edad").value
	let alias = document.querySelector("#formChat > #alias").value
	let avatar = document.querySelector("#formChat > #avatar").value
	let text = document.querySelector("#formChat > #text").value
	let fecha = new Date()

	let objetoMensaje = {
			author: {
				email: email,
				nombre: nombre, 
				apellido: apellido, 
				edad: edad, 
				alias: alias,
				avatar: avatar,
			},
			text: text,
			fecha: fecha
	}
	socket.emit("mensaje", objetoMensaje)
	console.log("se ejecuto el evento submit");
})
socket.on("mensajes", (data) => {
	if(data != undefined && Object.keys(data).length > 0){
		//--------------- Esquema de normalizr y desnormalizacion
		const schemaAuthor = new normalizr.schema.Entity("authors",{},{idAttribute: 'email'})
		const schemaArticulos = new normalizr.schema.Entity("articulos",{
			author: schemaAuthor
		})
		const postSchema = new normalizr.schema.Entity("post", {
		  mensajes: [schemaArticulos]
		})
		let desnormalizado = normalizr.denormalize(data.result, postSchema, data.entities)
		//--------------- Imprimiendo mensajes ya desnormalizados
		const mensajes = desnormalizado.mensajes
		.map(
			(msj) =>`Email: <strong style="color:blue; font-weight: bold">${msj.author.email}</strong> 
			-> Fecha: <strong style="color: brown">${msj.fecha}</strong>
			-> Mensaje: <strong style="color: green; font-style: italic">${msj.text}</strong>
			`
			)
			.join("<br>");
			document.querySelector("p").innerHTML = mensajes;
			
		//--------------- Porcentaje de compresion 
		const longitudNormaliz = JSON.stringify(data).length
		const longitudDesnormaliz = JSON.stringify(desnormalizado).length
		let porcentaje = (longitudNormaliz*100)/longitudDesnormaliz
		document.querySelector("#mensajeCompresionNormalizacion").innerHTML = `Porcentaje de compresion = %${porcentaje}`
		
	}
});