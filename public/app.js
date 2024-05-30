const socket = io();

document.getElementById('create-group').addEventListener('click', () => {
    document.getElementById('create-group-form').style.display = 'block';
    document.getElementById('create-group').style.display = 'none';
    document.getElementById('chat-box').style.display = 'none';
    document.getElementById('new-group-password').addEventListener('click', function() {
        const customGroupId = document.getElementById('custom-group-id').value.trim();
        if (customGroupId) {
            socket.emit('requestGroupId', { customGroupId });
        } else {
            socket.emit('requestGroupId', { customGroupId: null });
        }
    });
});

document.getElementById('create-group-button').addEventListener('click', () => {
    let groupId = document.getElementById('custom-group-id').value.trim();
    if (!groupId) {
        groupId = document.getElementById('group-id-text').textContent.trim();
    }
    const password = document.getElementById('new-group-password').value;
    if (groupId && password) {
        socket.emit('createGroup', { groupId, password });
    } else {
        alert('Enter Password');
    }
});

document.getElementById('join-group').addEventListener('click', () => {
    document.getElementById('join-group-form').style.display = 'block';
    document.getElementById('join-group').style.display = 'none';
});

document.getElementById('join-group-submit').addEventListener('click', () => {
    const groupId = document.getElementById('join-group-id').value;
    const password = document.getElementById('join-group-password').value;
    socket.emit('joinGroup', { groupId, password });
});

document.getElementById('send-message').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    const groupId = document.getElementById('chat-box').dataset.groupId;
    const username = document.getElementById('username').value.trim();
    if (message && username) {
        socket.emit('message', { groupId, message, username });
    } else {
        alert('Please enter a message and your name.');
    }
});

socket.on('groupIdAssigned', (groupId) => {
    document.getElementById('group-id-text').textContent = groupId;
    document.getElementById('create-group-button').dataset.groupId = groupId;
});

socket.on('createSuccess', (groupId) => {
    document.getElementById('chat-box').style.display = 'block';
    document.getElementById('chat-box').dataset.groupId = groupId;
    document.getElementById('create-group-form').style.display = 'none';
});

socket.on('joinSuccess', (groupId) => {
    document.getElementById('chat-box').style.display = 'block';
    document.getElementById('chat-box').dataset.groupId = groupId;
    document.getElementById('join-group-form').style.display = 'none';
});

socket.on('joinFailure', (message) => {
    alert(message);
});

socket.on('message', (data) => {
    const messageContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${data.message}`;
    messageContainer.appendChild(messageElement);
});
