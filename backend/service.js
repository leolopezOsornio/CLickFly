let isConnected = false; // Variable global para la conexión

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Importa las rutas de autenticación
const authRoutes = require("./routers/auth"); 
// Importa las rutas de los correos
const correosRoutes = require("./routers/correos"); 

const app = express();
// Aumentar el límite de tamaño del JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    isConnected = true;
    console.log("✅ Conectado a MongoDB Atlas - Base de datos: correos");
  })
  .catch(err => {
    isConnected = false;
    console.error("❌ Error al conectar a MongoDB:", err);
  });

// Usar las rutas de autenticación
app.use("/auth", authRoutes);

// Usar las rutas para los correos
app.use("/correos", correosRoutes);

// Ruta principal de prueba
app.get("/", (req, res) => {
  if (isConnected) {
    res.json({ message: "🚀 API funcionando correctamente en la base de datos 'correos'" });
  } else {
    res.json({ message: "❌ Error al conectar a la base de datos 'correos'" });
  }
});

// Servidor escuchando
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
