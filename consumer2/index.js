const exchange = process.env.EXCHANGE || 'kwetter'
const queueName = process.env.QNAME || 'consumer'
const mongourl = process.env.MONGO_URL || 'mongodb://root:root@mongodb:27017/consumer'

const amqp = require('amqplib/callback_api');
var json_data;

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

            console.log(mongourl)

            channel.bindQueue(queue.queue, exchange, '')
            channel.consume(queue.queue, data => {
                json_data = Buffer.from(data.content)

                console.log('Data: ' + json_data)
            })
        })
    })
})
