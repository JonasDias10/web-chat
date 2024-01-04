const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const webSocket = new WebSocket.Server({ server });

app.use('/', express.static(path.join(__dirname, 'public')));

const port = 8080 || process.env.PORT;
server.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
});

const ACTIONS = {
    CLIENTS_CONNECTED: 'clients_connected',
    MESSAGE: 'message',
    IMAGE: 'image'
}

webSocket.on('connection', (socket) => {
    updateConnectedClients();

    socket.on('close', () => {
        updateConnectedClients();
    });

    socket.on('message', (message) => {
        handleReceiveMessage(socket, JSON.parse(message));
    });
});

const handleReceiveMessage = (socket, message) => {
    switch(message.action) {
        case ACTIONS.MESSAGE:
            sendToAllUsersExceptTheSender(socket, message);
            break;
        case ACTIONS.IMAGE:
            handleSendImage(socket, message);
            break;
        default:
            console.log('Error: unknown action.');
    }
}

const handleSendImage = (socket, message) => {
    sendToAllUsersExceptTheSender(socket, message);
}

const updateConnectedClients = () => {
    const clientsCount = Array.from(webSocket.clients).length;
    
    const message = {
        action: ACTIONS.CLIENTS_CONNECTED,
        count: clientsCount
    };

    sendToAllUsers(message);
}

const sendToAllUsersExceptTheSender = (senderSocket, message) => {
    Array.from(webSocket.clients).forEach(client => {
        if (client !== senderSocket && client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify(message)
            );
        }
    });
}

const sendToAllUsers = (message) => {
    Array.from(webSocket.clients).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify(message)
            );
        }
    });
}