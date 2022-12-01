import { Router } from 'express'
import path from 'path'
import parseArgs from "minimist"
import { fork } from "child_process"
///------------- DE ESTE DESAFIO NUEVO ------------- ///
const routerDesafioNuevo = new Router()
routerDesafioNuevo.get("/info", (req, res)=>{
    res.render(path.join(process.cwd(), '/views/info.ejs'), {
        //No me toma el default, pero si se ingresa por informacion por consola la toma
        argv: JSON.stringify(parseArgs(process.argv.slice(2))) ,
        path: process.argv[1],
        sistema: process.platform,
        processId: process.pid,
        version: process.version,
        carpeta: process.cwd(),
        memoria: process.memoryUsage().rss
    })
    //console.log(parseArgs(process.argv.slice(2)));
})


routerDesafioNuevo.get("/randoms", (req, res)=>{
    const forked = fork(path.join(process.cwd(), 'calculo.js'))
    forked.on('message', msg =>{
        res.send(msg)
    })
    forked.send(req?.query?.cant || 100000)        
})

export default routerDesafioNuevo