const mongoose = require("mongoose");

const CorreosSchema = new mongoose.Schema({
  correo: { type: String, required: true },
  nombre: { type: String, required: true },
  nota: { type: String, required: true },
  latitud: { type: Number, required: true }, 
  longitud: { type: Number, required: true }, 
  imagen: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Correos = mongoose.model("Correos", CorreosSchema);
module.exports = Correos;
