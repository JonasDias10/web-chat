const URL = 'ws://localhost:8080';
const socket = new WebSocket(URL);
const messagesContainer = document.getElementById('chat-messages');

const ACTIONS = {
    CLIENTS_CONNECTED: 'clients_connected',
    MESSAGE: 'message',
    IMAGE: 'image'
}

document.getElementById('message-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const inputMessage = document.getElementById('message');
    const message = inputMessage.value;
    inputMessage.value = '';

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'right-message');
    messageContainer.innerText = message;
    messagesContainer.appendChild(messageContainer);

    handleSendMessage(message);
});

const handleSendMessage = (msg) => {
    const message = {
        action: ACTIONS.MESSAGE,
        message: msg,
        userName: sessionStorage.getItem('user-name')
    }

    socket.send(JSON.stringify(message));
}

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    switch(data.action) {
        case ACTIONS.CLIENTS_CONNECTED:
            handleUpdateConnectedClients(data.count);
            break;
        case ACTIONS.MESSAGE:
            handleReceiveMessage(data);
            break;
        case ACTIONS.IMAGE:
            handleReceiveImage(data);
            break;
        default:
            console.log('Error: Unknown action.');
    }
}); 

const handleReceiveMessage = (message) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'left-message');

    const span = document.createElement('span');
    const p = document.createElement('p');

    span.innerText = message.userName
    p.innerText = message.message;

    messageContainer.append(span, p);
    messagesContainer.appendChild(messageContainer);
};

const handleUpdateConnectedClients = (connectedClients) => {
    document.getElementById('online-count').innerText = connectedClients;
};

window.addEventListener('load', () => {
    if (sessionStorage.getItem('user-name')) {
        document.getElementById('welcome-chat').style.display = 'none';
    }
});

document.getElementById('welcome-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const userName = document.getElementById('user-name').value;
    sessionStorage.setItem('user-name', userName);

    document.getElementById('welcome-chat').style.display = 'none';
});

const inputFile = document.getElementById('input-file');
inputFile.addEventListener('change', (event) => {
    handleUploadImage();
});

const handleUploadImage = () => {
    const reader = new FileReader();

    reader.readAsDataURL(inputFile.files[0]);

    reader.onload = (event) => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message', 'right-message');

        const imageFile = event.target.result;

        const image = document.createElement('img');
        image.setAttribute('src', imageFile);
    
        messageContainer.appendChild(image);
        messagesContainer.appendChild(messageContainer);

        const message = {
            action: ACTIONS.IMAGE,
            file: imageFile,
            userName: sessionStorage.getItem('user-name')
        }

        socket.send(JSON.stringify(message));
    }

};

const handleReceiveImage = (message) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'left-message');

    const span = document.createElement('span');
    span.innerText = message.userName

    const image = document.createElement('img');
    image.setAttribute('src', message.file);

    messageContainer.append(span, image);
    messagesContainer.appendChild(messageContainer);
}