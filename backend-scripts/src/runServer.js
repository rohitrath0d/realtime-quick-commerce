import express from 'express';

const app = express();

const port= process.env.port || 4000;

app.get('/', (req, res)=> {
  res.send('quick comm backend up and running: /home-route')
})

app.listen(port, ()=> {
  console.log(`Server is running on port: http://localhost:${port}`)
})