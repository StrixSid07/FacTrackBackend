const mongoose = require('mongoose');

const fixValueSchema = new mongoose.Schema({
    fixSalCount: {type:Number, require:true}
})

module.exports = mongoose.model("Fixvalue", fixValueSchema);