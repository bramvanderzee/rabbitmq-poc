const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const exchange = process.env.EXCHANGE || 'kwetter'
const queueName = process.env.QNAME || 'consumer'

const amqp = require('amqplib/callback_api');
var ret;

app.get('/get-msg', (req, res) => {
    res.send(ret)
})

amqp.connect('amqp://rabbitmq:5672', (err0, connection) => {
    if (err0) {
        throw err0
    }

    connection.createChannel((err1, channel) => {
        if (err1) {
            throw err1
        }

        channel.assertExchange(exchange, 'fanout', {durable: false})
        channel.assertQueue(queueName, {durable: false}, (err2, queue) => {
            if (err2) {
                throw err2
            }

            channel.bindQueue(queue.queue, exchange, '')
            channel.consume(queue.queue, data => {
                ret = Buffer.from(data.content)
                console.log('Data: ' + ret)
                channel.ack(data);
            })

            app.listen(PORT, () => console.log("Server running at port " + PORT));
        })

    })

})
