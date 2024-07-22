const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require('body-parser');
const connection = require('./src/connection');
const format = require("mysql2").format;

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketIo(server);

// Arreglo para almacenar las ubicaciones de los usuarios reales
let userLocations = [];

// Definir el endpoint para obtener los usuarios
app.get('/usuario/:user/:password', (req, res) => {
  const { user, password } = req.params;
  const query = `SELECT * FROM Usuarios WHERE Usuario = ? AND Contraseña = ?`;
  connection.query(query, [user, password], (error, results) => {
    if (error) {
      console.error('Error ejecutando la consulta:', error.stack);
      return res.status(500).send('Error ejecutando la consulta a la base de datos');
    }
    res.json(results);
  });
});

app.post('/location', (req, res) => {
  const data = req.body;
  const query = format(`INSERT INTO Ubicaciones SET ?`, data);
  connection.query(query, data, (error, results) => {
    if (error) {
      console.error('Error ejecutando insert:', error.stack);
      return res.status(500).send('Error ejecutando la consulta a la base de datos');
    }
    res.json(results);
  });
});

// Escuchar las conexiones de socket.io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Enviar el socket.id al nuevo cliente
  socket.emit("yourId", socket.id);

  // Enviar la lista de ubicaciones al nuevo cliente
  socket.emit("updateLocations", userLocations);

  socket.on("ubicacion", (data) => {
    console.log(
      `Ubicación recibida: ID ${data.id}, Latitud ${data.lat}, Longitud ${data.lng}`
    );

    // Buscar y actualizar la ubicación del usuario
    const userIndex = userLocations.findIndex((user) => user.id === data.id);
    if (userIndex !== -1) {
      userLocations[userIndex].latitude = data.lat;
      userLocations[userIndex].longitude = data.lng;
    } else {
      // Si no se encuentra, añadir la nueva ubicación al arreglo
      userLocations.push({
        id: data.id,
        latitude: data.lat,
        longitude: data.lng,
      });
    }

    // Enviar la actualización a todos los clientes conectados
    io.emit("updateLocations", userLocations);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const port = process.env.PORT || 3000;

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});