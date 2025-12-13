import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './connections/db/db-init.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
// const socketConnection= socketIO(httpServer)
const socketConnection = new Server(httpServer, {
  cors: {
    origin: '*'  // for dev env only
  }
})

const port = process.env.SERVER_PORT || 4000;

app.get('/', (req, res) => {
  res.send('quick comm backend up and running: /home-route')
});

app.get('/health', (req, res) => res.send({
  status: 'health check successful',
  time: new Date().toISOString()
}));

// init socket connection
socketConnection.on('connection', (socket) => {
  // console.log('New user connected');
  console.log(`New user connected: ${socket.id}`);     // Logging socket ID (helps debugging)

  socket.emit('newMessage', {
    from: 'Server',
    text: 'Welcome',
    createdAt: Date.now()
  });

  socket.on('createMessage', (message) => {
    console.log('New message:', message);
    socketConnection.emit('newMessage', message)    // send to everyone
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

});

// attach io so routes/controllers can emit
app.set('io', socketConnection);

// connecting db
connectDB()
  .then(() => {
    console.log("Connected to Mongodb");
}).catch((err) => {
  console.error('Error connecting to the mongo db: ', err.message);
  process.exit(1);
});

// app.listen(port, ()=> {      // app -> server (for socket connection)
httpServer.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`)
});