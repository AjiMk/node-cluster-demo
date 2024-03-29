import express from "express";
import {fibonacci} from "./heavyComputation.mjs";

const app = express();

app.get("/", (req, res) => {
    console.log(`landing page: ${process.pid}`)
    res.send("Landing page")
})

// Define routes and middleware
app.get('/heavy', (req, res) => {
    for(let i=0;i<10;i++) {
        fibonacci(10000);
    }
    
  res.send('Hello World!');
});



export default app;