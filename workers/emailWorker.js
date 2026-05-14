const {Worker} = require("bullmq");
const emailWorker = new Worker(
    "emailQueue",
    async function(job){
        console.log("Processing job:", job.name);
        console.log("Job Data: ", job.data);
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379
        } 
    }
)

