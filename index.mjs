import cluster from "cluster";
import http from "http";
import {cpus} from "os";
import app from "./app.mjs";

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }
  
  // Listen for dying workers and fork a new one
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
    app.listen(3000);
}