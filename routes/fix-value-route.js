const express = require("express");
const router = express.Router();
const fixValueController = require("../controllers/fix-value-controller");

// Routes
router.get("/", fixValueController.getFixValue);       
router.post("/", fixValueController.createFixValue); 
router.put("/", fixValueController.updateFixValue);    
router.delete("/", fixValueController.deleteFixValue); 

module.exports = router;
