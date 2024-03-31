import cluster from "cluster";
import net from "net";
import express from "express";
import app from "./app.mjs";
import { cpus } from "os";

if(cluster.isPrimary) {
    
    /**
     * Cluster events
     * 
     */
    cluster.on("fork", (worker) => {
        console.log(`Cluster_event:fork: worker_id, ${worker.id},isDead: ${worker.isDead()}`);
    })

    cluster.on("exit", (worker) => {
        console.log(`Cluster_event:exit: worker_id, ${worker.id}, isDead:${worker.isDead()}`);
    })

    for(let i=0;i<cpus().length;i++) {
        const worker = cluster.fork();
        /**
         * Event will fire if the worker start listening to a port
         * 
         */
        worker.on("listening", (address) => {
            console.log(`worker listening on address, ${address.port}`);
            // worker.send({cmd:"kill"});
            // worker.send({cmd: "echo"});
            // worker.send({cmd:"report"});
            // worker.send({cmd:"disconnect"});
        })

        worker.on("online", () => {
          console.log("worker online")
          // worker.send({cmd:"disconnect"});
        })

        worker.on("message", (message) => {
            const workerId = worker.id;
            const command = message.cmd;
            const allWorkers = Object.values(cluster.workers);

            switch(command) {
                case "echo":
                  console.log(message);
                  break;
                case "kill":
                  process.kill(message.pid);
                  break;
                case "report":
                    console.log(`Worker id: ${message.worker_id}`);
                    break;
                case "disconnect":
                    if(worker) {
                        worker.disconnect();
                        console.log(`worker connection disconnected, worker_id:${workerId}`)
                    }
                    break;
                default:
                    console.log(message);
                    break;
            }
        })

        worker.on("error", (error) => {
          console.log(error);
        })

        worker.on("exit", () => {
          console.log("exited");
            if(!worker.exitedAfterDisconnect) {
                console.log("Worker exited without disconnect: respawn");
            }
        })

        worker.on("disconnect", () => {
            console.log(worker.id);
            console.log(`worker disconnected`);
        })
    }

    app.listen(3000)
}else if(cluster.isWorker){

    app.listen(3001);

    process.on("message", (message) => {
        const command = message.cmd;
        const workerId = cluster.worker.id;
        const pid = process.pid;

        switch(command) {
            case "kill":
              process.send({cmd:"kill",workerId: cluster.worker.id, pid: pid});
              break;
            case "echo":
              process.send({cmd:"echo", workerId: cluster.worker.id})
              break;
            case "disconnect":
                console.log(`disconnect the server connection!, worker_id:${workerId}, pid:${pid}`);
                process.send({cmd: "disconnect", worker_id: cluster.worker.id, pid:pid});
                break;
            case "report":
                process.send({cmd:"report", worker_id:cluster.worker.id});
                break;
        }
    })
}