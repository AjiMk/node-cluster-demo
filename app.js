import express from "express";
import { fibonacci } from "./heavyComputation.js";
import cluster from "cluster";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set("view engine", "ejs");

// Middleware setup (consider grouping related middleware)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.resolve(__dirname, 'views'));
app.use(express.static(path.resolve(__dirname, 'public')));

const getAllProcessList = (req, res) => {
    const workers = Object.values(cluster.workers);

    const allWorkerData = workers
        .filter(worker=> worker.process.killed===false)
        .map(worker => ({
            workerId: worker.id,
            pid: worker.process.pid,
        }));

    res.render("allProcessList", { allWorkerData }); 
};

app.get("/", (req, res) => {
    res.render(cluster.isMaster ? "processDashboard" : "dashboard");
});

app.get("/process-list", getAllProcessList);

app.post("/process-kill", (req, res, next) => {
    if (cluster.isMaster) {
        const pid = Number(req.body.pid || 0);
        const singleWorker = Object.values(cluster.workers).find(worker => worker.process.pid === pid);

        if (singleWorker) {
            singleWorker.kill();
        }

        next();
    }else{
        return res.status(401).send();
    }

}, getAllProcessList);

app.get('/heavy', (req, res) => {
    for (let i = 0; i < 10; i++) {
        fibonacci(10000);
    }
    res.send('Hello World!');
});

export default app;