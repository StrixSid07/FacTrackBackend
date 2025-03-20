const express = require("express");
const router = express.Router();
const fixValueController = require("../controllers/fix-value-controller");

// Routes
router.get("/:category/:month?", fixValueController.getFixValue);       
router.post("/", fixValueController.createFixValue); 
router.put("/:category", fixValueController.updateFixValue);    
router.delete("/:category", fixValueController.deleteFixValue); 

module.exports = router;
