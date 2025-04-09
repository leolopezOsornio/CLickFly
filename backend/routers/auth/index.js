const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../../models/Users");

const router = express.Router();

// 🔹 RUTA DE LOGIN (Sólo con username)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "❌ Nombre de usuario y contraseña son requeridos" });
  }

  try {
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "❌ Usuario no encontrado" });
    }

    // Hash de la contraseña ingresada
    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashedPassword = hash.digest("hex");
    console.log(hashedPassword);

    // Verificar contraseña
    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: "❌ Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "5h" });

    // Guardar última fecha de inicio de sesión
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: "✅ Login exitoso",
      token,
      datosUser: {
        nombreCompleto: user.fullName,
        usuario: user.username,
        email: user.email
      },
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    res.status(500).json({ message: "❌ Error en el servidor" });
  }
});

// 🔹 RUTA DE REGISTRO
router.post("/register", async (req, res) => {
  const { email, fullName, username, password } = req.body;

  if (!email || !fullName || !username || !password) {
    return res.status(400).json({ message: "❌ Todos los campos son requeridos" });
  }

  try {
    // Verificar si el email ya está registrado
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "❌ El correo electrónico ya está en uso" });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "❌ El nombre de usuario ya está en uso" });
    }

    // Hash de la contraseña utilizando SHA-256
    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashedPassword = hash.digest("hex");

    // Crear un nuevo usuario con la contraseña cifrada
    const newUser = new User({
      email,
      fullName,
      username,
      password: hashedPassword,
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    res.status(201).json({ message: "✅ Usuario registrado exitosamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error al registrar el usuario" });
  }
});

module.exports = router;
