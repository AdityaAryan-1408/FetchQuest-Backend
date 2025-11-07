require('dotenv').config();
const express = require('express');
const connectDB = require('./db/connectDB');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');


const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const authRouter = require('./routes/authRoutes');
const requestRouter = require('./routes/requestRoutes');
const userRouter = require('./routes/userRoutes');

const Message = require('./models/Message');
const Request = require('./models/Request');
const User = require('./models/User');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
    }
})

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.get('/', (req, res) => {
    res.send('<h1>FetchQuest API</h1>');
});

app.use('/api/auth', authRouter);
app.use('/api/requests', requestRouter);
app.use('/api/users', userRouter);

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // When a user joins a specific quest's chat
    socket.on('joinRoom', async ({ questId, userId }) => {
        try {
            socket.join(questId);
            console.log(`User ${socket.id} (user ID: ${userId}) joined room: ${questId}`);

            // Fetch quest details
            const quest = await Request.findById(questId)
                .populate('requesterId', 'name profilePictureUrl')
                .populate('runnerId', 'name profilePictureUrl');

            if (!quest) {
                return; // Quest not found
            }

            // Determine who the "other user" is
            const isRequester = quest.requesterId._id.toString() === userId;
            const otherUser = isRequester ? quest.runnerId : quest.requesterId;

            // Send quest details and other user's info to the client
            socket.emit('questDetails', { quest, otherUser });

            // Fetch and send message history
            const history = await Message.find({ questId }).sort({ createdAt: 'asc' });
            socket.emit('messageHistory', history);

        } catch (error) {
            console.error('Error in joinRoom:', error);
        }
    });

    // When a user sends a message
    socket.on('sendMessage', async (messageData) => {
        try {
            // Save the message to the database
            const newMessage = await Message.create(messageData);

            // Broadcast the message to the other user in the room
            // We use socket.to() to send to everyone *except* the sender
            socket.to(messageData.questId).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // When a user leaves the room (e.g., navigates away)
    socket.on('leaveRoom', ({ questId }) => {
        socket.leave(questId);
        console.log(`User ${socket.id} left room: ${questId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Socket.IO automatically handles leaving rooms on disconnect
    });
});
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();