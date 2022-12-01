import {normalize, denormalize, schema} from 'normalizr'

const schemaAuthor = new schema.Entity("authors",{},{idAttribute: 'email'})
const schemaArticulos = new schema.Entity("articulos",{
    author: schemaAuthor
})
const postSchema = new schema.Entity("post", {
  mensajes: [schemaArticulos]
})


export const normalizar = (data) =>{
    return normalize({id:"mensajes", mensajes: data}, postSchema)
}