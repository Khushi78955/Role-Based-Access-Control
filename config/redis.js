const { createClient } = require("redis");
const redisClient = createClient();

redisClient.on("error", function(err){
    console.log("Redis Error", err);
})

async function connectRedis(){
    await reditClient.connect();
    console.log("Redis connected");
}

module.exports = {redisClient, connectRedis}