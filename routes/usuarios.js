const {Router} = require("express")
const {getUsers, getUserByID, deleteUserByID, addUser} = require("../controllers/usuarios")
const router = Router()

//http://localhost:4000/api/v1/usuarios?id=3

/// GET ///
router.get("/", getUsers)
router.get("/id/:id", getUserByID)

/// POST ///
router.post("/", addUser)

/// DELETE ///
router.delete("/", deleteUserByID)

module.exports = router