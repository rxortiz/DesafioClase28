process.on("message", msg =>{
    let numeros = [];
    let objetoNumeros = [];
    const generarNumeros = () => {
        for (let i = 0; i < msg; i++) { 		
            numeros.push(parseInt(Math.random() * 1000 + 1)); 	
        }
        verificar(); 
        return objetoNumeros
    }; 
    const verificar = () => { 	
        let contador = 0; 	
        let indice; 	
        for (let j = 1; j <= 1000; ) { 		
            indice = numeros.indexOf(j);
            if (indice != -1) { 			
                contador++; 			
                numeros.splice(indice, 1); 		
            } else { 			
                objetoNumeros.push({ [j]: contador }); 			
                contador = 0; 			
                j++; 		
            } 	
        }
    };  
    process.send(generarNumeros());
})