const { request, response } = require("express");
const bcryptjs = require("bcryptjs")
const pool = require("../db/connection")
const getUsers = async (req = request, res = response) =>{
    //estructura basica de cualquier endpoint al conectar en su BD
    
    let conn;
    //control de exepciones
    try {
        conn = await pool.getConnection()
        //esta es la consulta mas basica, se pueden hacer mas complejas
        const users = await conn.query("SELECT * FROM Usuarios", (error) => {throw new Error(error) })
        //siempre validar que no se obtuvieron resultados
        if (!users) {
            res.status(404).json({msg:"no se encontraron registros"})
            return
        }
        res.json({users})
        //lo del cath y final siempre sera lo mismo
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }finally{
        if(conn){
            conn.end()
        }
    }
}

const getUserByID = async (req = request, res = response) =>{
    //estructura basica de cualquier endpoint al conectar en su BD
    const {id} = req.params
    let conn;
    //control de exepciones
    try {
        conn = await pool.getConnection()
        //esta es la consulta mas basica, se pueden hacer mas complejas
        const [user] = await conn.query(`SELECT * FROM Usuarios WHERE ID = ${id}`, (error) => {throw new Error(error) })
        //siempre validar que no se obtuvieron resultados
        if (!user) {
            res.status(404).json({msg: `No se encontró registro con el ID ${id}`})
            return
        }
        res.json({user})
        //lo del cath y final siempre sera lo mismo
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }finally{
        if(conn){
            conn.end()
        }
    }
}

const deleteUserByID = async (req = request, res = response) =>{
    //Estructura basica de cualquier endpoint al conectar en su BD
    const {id} = req.query
    let conn;
    //Control de exepciones
    try {
        conn = await pool.getConnection()
        //Esta es la consulta mas basica, se pueden hacer mas complejas
        const {affectedRows} = await conn.query(`UPDATE Usuarios SET Activo = 'N' WHERE ID = ${id}`, (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!affectedRows === 0) {
            res.status(404).json({msg: `No se pudo eliminar el registro con el ID ${id}`})
            return
        }
 
        res.json({msg: `El usuario con ID ${id} se eliminó sastifactoriamente. `})
        //Lo del catch y final siempre sera lo mismo
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }finally{
        if(conn){
            conn.end()
        }
    }
}

const addUser = async (req = request, res = response) =>{
    //Estructura basica de cualquier endpoint al conectar en su BD
    const {
        Nombre,
        Apellidos,
        Edad,
        Genero,
        Usuario,
        Contrasena,
        Fecha_Nacimiento = '1900-01-01',
        Activo
    } = req.body

    if (
        !Usuario ||
        !Nombre ||
        !Apellidos ||
        !Edad ||
        !Contrasena ||
        !Activo
    ){
        res.status(400).json({msg: "Falta información del usuario"})
        return
    }

    let conn;
    //Control de exepciones
    try {
        conn = await pool.getConnection()
        //Esta es la consulta mas basica, se pueden hacer mas complejas

        const [user] = await conn.query(`SELECT Usuario FROM Usuarios WHERE Usuario = '${Usuario}'`)

        if (user) {
            res.status(403).json({msg: `El usuario ${Usuario} ya se encuentra registrado.`})
            return
        }

        const salt = bcryptjs.genSaltSync()
        const contrasenaCifrada = bcryptjs.hashSync(Contrasena, salt)

        const {affectedRows} = await conn.query(`
        INSERT INTO Usuarios (
            Usuario,
            Nombre,
            Apellidos,
            Edad,
            Genero,
            Contrasena,
            Fecha_Nacimiento,
            Activo
        ) VALUES (
            '${Usuario}',
            '${Nombre}',
            '${Apellidos}',
            '${Edad}',
            '${Genero || ''}',
            '${contrasenaCifrada}',
            '${Fecha_Nacimiento}',
            '${Activo}'
        )
        `, (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!affectedRows === 0) {
            res.status(404).json({msg: `No se pudo agregar el registro del Usuario ${Usuario}`})
            return
        }
 
        res.json({msg: `El usuario ${Usuario} se agrego sastifactoriamente. `})
        //Lo del catch y final siempre sera lo mismo
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }finally{
        if(conn){
            conn.end()
        }
    }
}

const updateUserByUsuario = async (req = request, res = response) =>{
    //Estructura basica de cualquier endpoint al conectar en su BD
    const {
        Nombre,
        Apellidos,
        Edad,
        Genero,
        Usuario,
        Contrasena,
        Fecha_Nacimiento = '1900-01-01'
        
    } = req.body

    if (
        !Nombre ||
        !Apellidos ||
        !Edad ||
        !Usuario ||
        !Contrasena 

    ) {
        res.status(400).json({msg: "Falta información del usuario"})
        return
    }

    let conn;
    //Control de exepciones
    try {
        conn = await pool.getConnection()
        //Esta es la consulta mas basica, se pueden hacer mas complejas

        const [user] = await conn.query(`
        SELECT Usuario, Nombre, Apellidos, Edad, Genero, Fecha_Nacimiento 
        FROM Usuarios 
        WHERE Usuario = '${Usuario}'
        `)
        
        if (!user) {
            res.status(403).json({msg: `El usuario ${Usuario} no se encuentra registrado.`})
            return
        }
         
        const {affectedRows} = await conn.query(`
        UPDATE Usuarios SET  
            Nombre = '${Nombre || user.Nombre}',
            Apellidos = '${Apellidos || user.Apellidos}',
            Edad = '${Edad || user.Edad}',
            Genero = '${Genero || user.Genero}',
            Fecha_Nacimiento = '${Fecha_Nacimiento}'
            WHERE Usuario = '${Usuario}'

        `, (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!affectedRows === 0) {
            res.status(404).json({msg: `No se pudo agregar el registro del Usuario ${Usuario}`})
            return
        }
 
        res.json({msg: `El usuario ${Usuario} se actualizó sastifactoriamente. `})
        //Lo del catch y final siempre sera lo mismo
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }finally{
        if(conn){
            conn.end()
        }
    }
}

const signIn = async (req = request, res = response) => {
    const {
       Usuario,
       Contrasena,
       } = req.body
    if(      
    !Usuario||
    !Contrasena
    ){
       res.status(400).json({msg: "Falta informacion del usuario"})
       return
    }
    let conn;
   
    try {
       conn = await pool.getConnection()
 
       const [user] = await conn.query(`SELECT Usuario, Contrasena, Activo FROM Usuario WHERE Usuario = '${Usuario}'`)
 
       if(!user || user.Activo === 'N'){
          let code = !user ? 1 : 2;
          res.status(403).json({msg: `El Usuario o la contraseña son incorrectas.`, errorCode: code})
          return
       }
 
       const accesoValido = bcrypt.compareSync(Contrasena, user.Contrasena)
 
       if (!accesoValido) {
          res.status(403).json({msg: `El Usuario o la contraseña son incorrectas.`, errorCode: 3})
          return
       }
 
       res.json({msg: `el usuario ${Usuario} ha iniciado sesion satisfactoriamente`})
       return
    } catch (error) {
       console.log(error)
       res.status(500).json({error})
    } finally{
       if (conn) {
           conn.end()
       }
    }
   }

module.exports = {getUsers, getUserByID, deleteUserByID ,addUser, updateUserByUsuario, signIn}