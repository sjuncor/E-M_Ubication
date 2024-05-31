const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Geolocalización con Socket.io</title>
        </head>
        <body>
            <h1>Enviar ubicación al servidor</h1>
            <button id="sendLocation">Enviar ubicación</button>

            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                document.getElementById('sendLocation').addEventListener('click', () => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            socket.emit('ubicacion', { lat, lng });
                        }, (error) => {
                            console.error('Error al obtener la ubicación', error);
                        });
                    } else {
                        console.log('La geolocalización no está disponible en este navegador.');
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Escuchar las conexiones de socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('ubicacion', (data) => {
        console.log(`Ubicación recibida: Latitud ${data.lat}, Longitud ${data.lng}`);
        // Aquí puedes manejar la ubicación recibida, guardarla en una base de datos, etc.
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});