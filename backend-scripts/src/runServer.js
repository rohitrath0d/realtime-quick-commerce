import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './connections/db/db-init.js';
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth-routes.js";
import orderRoutes from './routes/order-routes.js';
import productRoutes from './routes/product-routes.js';
import deliveryRoutes from './routes/delivery-routes.js'
import adminRoutes from './routes/admin-routes.js'
import storeRoutes from './routes/store-routes.js'
import paymentRoutes from './routes/payment-routes.js'

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL
];

app.use(express.json());
// app.use(cors());

// cors config
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));


const httpServer = http.createServer(app);
// const socketConnection= socketIO(httpServer)
const socketConnection = new Server(httpServer, {
  cors: {
    // origin: '*',  // for dev env only
    origin: process.env.NEXT_FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
})

const port = process.env.SERVER_PORT || 4000;

app.get('/', (req, res) => {
  res.send('quick comm backend up and running: /home-route')
});

app.get('/health', (req, res) => res.send({
  status: 'health check successful',
  service: 'quick-comm-backend',
  uptime: process.uptime(),
  time: new Date().toISOString()
}));

// API health check (used by Nginx / infra)
app.get('/api/health', (req, res) => {
  res.send({
    status: 'healthy',
    service: 'quick-comm-backend',
  });
});


// routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/payment", paymentRoutes);


// error handler 
app.use(errorHandler);


// init socket connection
socketConnection.on('connection', (socket) => {
  // console.log('New user connected');
  console.log(`New user connected: ${socket.id}`);     // Logging socket ID (helps debugging)

  socket.on('join_room', room => socket.join(room));

  socket.on('disconnect', () => console.log('socket disconnected', socket.id));

});

// attach io so routes/controllers can emit
app.set('io', socketConnection);

// // connecting db
connectDB()
  .then(() => {
    console.log("Connected to Mongodb main server embedd import check..");
  }).catch((err) => {
    console.error('Error connecting to the mongo db: ', err.message);
    process.exit(1);
  });

// // app.listen(port, ()=> {      // app -> server (for socket connection)
httpServer.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`)
});

// // START SERVER ONLY AFTER DB CONNECTS
// const startServer = async () => {
//   try {
//     await connectDB();   // BLOCKS until DB is connected
//     console.log("MongoDB connected successfully");

//     httpServer.listen(port, () => {
//       console.log(`Server is running on port: http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error("Failed to start server:", err.message);
//     process.exit(1);
//   }
// };

// startServer();