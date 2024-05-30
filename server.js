const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const groups = {}; // Store groups and their details

app.use(express.static('public')); // Serve static files

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('requestGroupId', (data) => {
        let groupId;
        if (data.customGroupId) {
            if (groups[data.customGroupId]) {
                socket.emit('groupIdAssigned', null); // Indicate the group ID is taken
            } else {
                groupId = data.customGroupId;
            }
        } else {
            groupId = uuidv4(); // Generate a unique group ID
        }

        if (groupId) {
            socket.emit('groupIdAssigned', groupId);
        }
    });

    socket.on('createGroup', (data) => {
        const { groupId, password } = data;
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;
            groups[groupId] = { password: hash };
            socket.join(groupId);
            socket.emit('createSuccess', groupId);
        });
    });

    socket.on('joinGroup', (data) => {
        const { groupId, password } = data;
        if (groups[groupId]) {
            bcrypt.compare(password, groups[groupId].password, (err, result) => {
                if (err) throw err;
                if (result) {
                    socket.join(groupId);
                    socket.emit('joinSuccess', groupId);
                } else {
                    socket.emit('joinFailure', 'Invalid password');
                }
            });
        } else {
            socket.emit('joinFailure', 'Group not found');
        }
    });

    socket.on('message', (data) => {
        const { groupId, message, username } = data;
        io.to(groupId).emit('message', { message, username });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
