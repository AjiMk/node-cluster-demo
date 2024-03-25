import {availableParallelism} from "os";
import cluster from "cluster";
import http from "http";

if(cluster.isMaster) {
    for(let i=0; i<availableParallelism();i++) {
        const worker = cluster.fork();

        worker.on("disconnect", () => {
            console.log("disconnected!");
        })

        worker.on("error", (error) => {
            console.log("Worker error event!");
            console.log(error);
        })

        worker.on('exit', (code, signal) => {
            if (signal) {
              console.log(`worker was killed by signal: ${signal}`);
            } else if (code !== 0) {
              console.log(`worker exited with error code: ${code}`);
            } else {
              console.log('worker success!');
            }
        });

        worker.on("listening", (address) => {
            console.log(process.pid);
        })

        worker.on("message", (msg)=> {
            console.log(msg)
        })

        worker.on("online", () => {
            console.log(`Worker online ${process.pid}`)
        })
    }

}else{
    http.createServer((req, res) => {
        const worker = cluster.worker;
        res.end(`worker_id:${cluster.worker.id}`);
    }).listen("8080");
}


