const { request, response } = require("express");
const bcryptjs = require("bcryptjs")
const pool = require("../db/connection")
modeloUsuarios = require("../models/usuarios");

const getUsers = async (req = request, res = response) =>{
    //Estructura basica de cualquier endpoint al conectar en su BD
    
    let conn;
    //Control de exepciones
    try {
        conn = await pool.getConnection()
        //Esta es la consulta mas basica, se pueden hacer mas complejas
        const users = await conn.query(modeloUsuarios.queryGetUsers, (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!users) {
            res.status(404).json({msg:"No se encontraron registros"})
            return
        }
        res.json({users})
        //Lo del cath y final siempre sera lo mismo
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
    //Estructura basica de cualquier endpoint al conectar en su BD
    const {id} = req.params
    let conn;
    //Control de exepciones
    try {
        conn = await pool.getConnection()
        //Esta es la consulta mas basica, se pueden hacer mas complejas
        const [user] = await conn.query(modeloUsuarios.queryGetUsersByID, [id], (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!user) {
            res.status(404).json({msg: `No se encontró registro con el ID ${id}`})
            return
        }
        res.json({user})
        //Lo del cath y final siempre sera lo mismo
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
        const {affectedRows} = await conn.query(modeloUsuarios.queryDeleteUserByID, [id], (error) => {throw new Error(error) })
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

        const [user] = await conn.query(modeloUsuarios.queryGetUserExists, [Usuario])
        if (user) {
            res.status(403).json({msg: `El usuario ${Usuario} ya se encuentra registrado.`})
            return
        }

        const salt = bcryptjs.genSaltSync()
        const contrasenaCifrada = bcryptjs.hashSync(Contrasena, salt)

        const {affectedRows} = await conn.query(modeloUsuarios.queryAddUser, [
            Nombre,
            Apellidos,
            Edad,
            Genero || '',
            Usuario,
            contrasenaCifrada,
            Fecha_Nacimiento,
            Activo
        ], (error) => {throw new Error(error) })
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

        const [user] = await conn.query(modeloUsuarios.queryGetUserInfo, [Usuario]) 
        
        if (!user) {
            res.status(403).json({msg: `El usuario ${Usuario} no se encuentra registrado.`})
            return
        }
         
        const {affectedRows} = await conn.query(modeloUsuarios.queryUpdateByUsuario, [
            Nombre || user.Nombre,
            Apellidos || user.Apellidos,
            Edad || user.Edad,
            Genero || user.Genero,
            Fecha_Nacimiento,
            Usuario,
            ], (error) => {throw new Error(error) })
        //Siempre validar que no se obtuvieron resultados
        if (!affectedRows === 0) {
            res.status(404).json({msg: `No se pudo agregar el registro del Usuario ${Usuario}`})
            return
        }
 
        res.json({msg: `El usuario ${Usuario} se actualizó sastifactoriamente.`})
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

const signIn = async (req = request, res = response) =>{
    //Estructura basica de cualquier endpoint al conectar en su BD
    const {
        Usuario,
        Contrasena,
    } = req.body

    if (
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

        const [user] = await conn.query(modeloUsuarios.querySignin, [Usuario])
    
        if (!user || user.Activo === 'N') {
            let code = !user ? 1 : 2;
            res.status(403).json({msg: `El Usuario o la contraseña son incorrectas.`, errorCode: code})
            return
        }

        const accesoValido = bcrypt.compareSync(Contrasena, user.Contrasena)

        if (!accesoValido) {
            res.status(403).json({msg: `El Usuario o la contraseña son incorrectas.`, errorCode: 3})
            return
        }

        res.json({msg: `El usuario ${Usuario} ha iniciado sesión satisfactoriamente`})
        return
        }catch(error) {
            console.log(error)
            res.status(500).json({error})
        }finally{
            if (conn) {
                conn.end()
        }
    }
}

const CambioContrasena=async(req = request,res = response) => {
    const{

        Usuario,
        Contrasena,
        NuevaContrasena
    }=req.body
    if(
        !Usuario||
        !Contrasena||
        !NuevaContrasena
    ){
        res.status(400).json({msg:"Falta información del usuario" })
    return
    }
 let conn;
     try{
         conn=await pool.getConnection()

         const [user]=await conn.query(`SELECT Usuario, Contrasena, Activo FROM Usuarios WHERE Usuario= '${Usuario}'`)
         if (!user || user.Activo==='N'){
            let code =!user? 1 : 2;

            res.status(403).json({msg:`El usuario o la contraseña son incorrectos`, errorCode:code})
        return
         }
        const accesoValido=bcryptjs.hashSync.compareSync(Contrasena,user.Contrasena)
        if(!accesoValido){
        res.status(403).json({msg:`El usuario o la contraseña son incorrectos`,errorCode:3} )
        return
        }  

         res.json({msg:`El usuario con ${Usuario}ha cambiado contraseña satisfactoriamente `})
     } catch(error){
         console.log(error)
         res.status(500).json({error})
     }finally{
         if(conn){
             conn.end()
         }
     }
 
    }
 
module.exports = {getUsers, getUserByID, deleteUserByID ,addUser, updateUserByUsuario, signIn,CambioContrasena}