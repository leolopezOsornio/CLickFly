const express = require("express");
const jwt = require("jsonwebtoken");
const Correos = require("../../models/Correos");
const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const { bucket } = require("../../storage");

// Middleware para verificar el JWT
const verifyToken = (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "❌ Token requerido - verificando" });
    }

    // Verificar si el token tiene el prefijo "Bearer "
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ Error al verificar token:", err);
            return res.status(401).json({ message: "❌ Token inválido o expirado" });
        }
        req.userId = decoded.id;
        next();
    });
};


// Ruta para traer los correos
router.post("/traerCorreos", verifyToken, async (req, res) => {
    try {
        const correos = await Correos.find({ userId: req.userId });
        res.status(200).json(correos);
    } catch (err) {
        console.error("Error al obtener los correos - 66t :", err);
        res.status(500).json({ message: "❌ Error al obtener los correos - 66t" });
    }
});

// Ruta para insertar un correo

router.post("/insertarCorreos", verifyToken, async (req, res) => {
    const { correo, nombre, nota, latitud, longitud, imagen } = req.body;

    if (!correo || !nombre || !nota || latitud === undefined || longitud === undefined) {
        return res.status(400).json({ message: "❌ Todos los campos requeridos deben ser enviados" });
    }

    let imageUrl = "";

    if (imagen) {
        try {
            const buffer = Buffer.from(imagen, "base64");
            const fileName = `images/${uuidv4()}.png`;
            const file = bucket.file(fileName);

            await file.save(buffer, {
                metadata: { contentType: "image/png" },
                public: true,
            });

            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        } catch (error) {
            console.error("❌ Error al subir la imagen:", error);
            return res.status(500).json({ message: "❌ Error al subir la imagen" });
        }
    }

    try {
        const newCorreo = new Correos({
            correo,
            nombre,
            nota,
            latitud,
            longitud,
            imagen: imageUrl, // Solo guardamos la URL en la base de datos
            userId: req.userId,
        });

        await newCorreo.save();
        res.status(201).json({ message: "✅ Correo insertado correctamente" });
    } catch (err) {
        console.error("Error al insertar el correo:", err);
        res.status(500).json({ message: "❌ Error al insertar el correo" });
    }
});


router.post("/eliminarCorreo", verifyToken, async (req, res) => {
    const { correoId } = req.body;

    if (!correoId) {
        return res.status(400).json({ message: "❌ Se requiere un ID de correo para eliminar" });
    }

    try {
        // Buscar el correo en la base de datos
        const correo = await Correos.findOne({ _id: correoId, userId: req.userId });

        if (!correo) {
            return res.status(404).json({ message: "❌ Correo no encontrado" });
        }

        // Si el correo tiene una imagen, eliminarla de Google Cloud Storage
        if (correo.imagen) {
            try {
                const fileName = correo.imagen.split("/").pop(); // Obtener el nombre del archivo
                const file = bucket.file(`images/${fileName}`);
                await file.delete();
            } catch (error) {
                console.error("⚠️ Error al eliminar la imagen del almacenamiento:", error);
                return res.status(500).json({ message: "⚠️ Error al eliminar la imagen del almacenamiento" });
            }
        }

        // Eliminar el correo de la base de datos
        await Correos.findByIdAndDelete(correoId);

        res.status(200).json({ message: "✅ Correo eliminado correctamente" });
    } catch (err) {
        console.error("❌ Error al eliminar el correo:", err);
        res.status(500).json({ message: "❌ Error al eliminar el correo" });
    }
});

// Ruta para editar un correo
router.post("/editarCorreo", verifyToken, async (req, res) => {
    const { _id, correo, nombre, nota, imagen } = req.body.data;

    if (!correo || !nombre || !nota || !_id) {
        return res.status(400).json({ message: "❌ Los campos correo, nombre, nota y _id son obligatorios" });
    }

    try {
        // Buscar el correo en la base de datos
        const correoEncontrado = await Correos.findOne({ _id, userId: req.userId });

        if (!correoEncontrado) {
            return res.status(404).json({ message: "❌ Correo no encontrado o no pertenece al usuario" });
        }

        // Si la imagen es base64, procesarla
        let imageUrl = correoEncontrado.imagen; // Mantener la imagen anterior si no hay nueva

        if (imagen && imagen.startsWith("data:image/")) { // Si la imagen es base64
            // Eliminar la imagen anterior de Google Cloud Storage si existe
            if (correoEncontrado.imagen) {
                try {
                    const fileName = correoEncontrado.imagen.split("/").pop();
                    const file = bucket.file(`images/${fileName}`);
                    await file.delete();
                } catch (error) {
                    console.error("⚠️ Error al eliminar la imagen anterior del almacenamiento:", error);
                    return res.status(500).json({ message: "⚠️ Error al eliminar la imagen anterior" });
                }
            }

            // Subir la nueva imagen a Google Cloud Storage
            try {
                const buffer = Buffer.from(imagen.split(",")[1], "base64");
                const fileName = `images/${uuidv4()}.png`;
                const file = bucket.file(fileName);

                await file.save(buffer, {
                    metadata: { contentType: "image/png" },
                    public: true,
                });

                imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            } catch (error) {
                console.error("❌ Error al subir la nueva imagen:", error);
                return res.status(500).json({ message: "❌ Error al subir la nueva imagen" });
            }
        }

        // Actualizar el correo con los nuevos datos
        correoEncontrado.correo = correo;
        correoEncontrado.nombre = nombre;
        correoEncontrado.nota = nota;
        correoEncontrado.imagen = imageUrl;

        await correoEncontrado.save();

        res.status(200).json({ message: "✅ Correo actualizado correctamente", correo: correoEncontrado });
    } catch (err) {
        console.error("❌ Error al actualizar el correo:", err);
        res.status(500).json({ message: "❌ Error al actualizar el correo" });
    }
});


module.exports = router;
