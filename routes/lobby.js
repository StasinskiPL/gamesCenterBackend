const express = require("express");
const controller = require("../controllers/lobby")

const router = express.Router();


router.get("/createRoom", controller.createRoom)





module.exports = router;