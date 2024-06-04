const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server);

// Arreglo para almacenar las ubicaciones de los usuarios
let userLocations = [
  { name: "User1", latitude: 4.60971, longitude: -74.08175 },
  { name: "User2", latitude: 4.61271, longitude: -74.08275 },
  { name: "User3", latitude: 4.61671, longitude: -74.08375 },
  { name: "User4", latitude: 4.62071, longitude: -74.08475 },
  { name: "User5", latitude: 4.62471, longitude: -74.08575 },
  { name: "User6", latitude: 4.62871, longitude: -74.08675 },
  { name: "User7", latitude: 4.63271, longitude: -74.08775 },
  { name: "User8", latitude: 4.63671, longitude: -74.08875 },
  { name: "User9", latitude: 4.64071, longitude: -74.08975 },
  { name: "User10", latitude: 4.64471, longitude: -74.09075 },
];

// Función para actualizar las ubicaciones aleatoriamente
const updateLocationsRandomly = () => {
  userLocations = userLocations.map((user) => {
    const newLatitude = user.latitude + (Math.random() - 0.5) * 0.001;
    const newLongitude = user.longitude + (Math.random() - 0.5) * 0.001;
    return { ...user, latitude: newLatitude, longitude: newLongitude };
  });
  io.emit("updateLocations", userLocations);
};

// Escuchar las conexiones de socket.io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Enviar la lista de ubicaciones al nuevo cliente
  socket.emit("updateLocations", userLocations);

  socket.on("ubicacion", (data) => {
    console.log(
      `Ubicación recibida: Latitud ${data.lat}, Longitud ${data.lng}`
    );

    // Buscar y actualizar la ubicación del usuario
    const userIndex = userLocations.findIndex(
      (user) => user.name === data.name
    );
    if (userIndex !== -1) {
      userLocations[userIndex].latitude = data.lat;
      userLocations[userIndex].longitude = data.lng;
    } else {
      // Si no se encuentra, añadir la nueva ubicación al arreglo
      userLocations.push({
        name: data.name,
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

// Iniciar la actualización periódica
setInterval(updateLocationsRandomly, 5000); // Actualiza cada 5 segundos

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
