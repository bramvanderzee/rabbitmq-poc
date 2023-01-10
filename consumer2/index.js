const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3001;

const amqp = require('amqplib');
var channel, connection;

function sleep(millis) {
    return new Promise(r => setTimeout(r, millis))
}

connectQueue();
async function connectQueue() {
    await sleep(5000);
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel()
        
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("test-queue")
    } catch (error) {
        console.log(error)
    }
}

app.get('/get-msg', (req, res) => {
    var ret;
    try {
        channel.consume('test-queue', data => {
            ret = Buffer.from(data.content)
            console.log('Data: ' + ret)
            channel.ack(data);
        })
        res.send(ret)
    } catch(err) {
        console.log(err);
        res.send(500)
    }

})

app.listen(PORT, () => console.log("Server running at port " + PORT));
