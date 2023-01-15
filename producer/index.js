const express = require('express')
const amqp = require('amqplib/callback_api')
const app = express()
const PORT = 3000
const exchange = 'kwetter'

app.use(express.json())

amqp.connect('amqp://rabbitmq:5672', (err0, connection) => {
    if (err0) {
            throw err0
    }

    connection.createChannel((err1, channel) => {
        if (err1) {
            throw err1
        }

        channel.assertExchange(exchange, 'fanout', { durable: false })
        channel.assertQueue('consumer1', {durable: false}, (err2, q1) => {
            if (err2) {
                throw err2
            }

            channel.bindQueue(q1.queue, exchange, '')
        })
        channel.assertQueue('consumer2', {durable: false}, (err3, q2) => {
            if (err3) {
                throw err3
            }

            channel.bindQueue(q2.queue, exchange, '')
        })

        app.delete('/kweet/:id', (req, res) => {
            const id = req.params.id
            const data = {
                body: req.body,
                id: id
            }

            channel.publish('kwetter', '', Buffer.from(JSON.stringify(data)))
            console.log('Deleted ' + id)
            res.send('Deleted ' + id)
        })

        app.post('/*', (req, res) => {
            const data = {
                method: req.method,
                url: req.url,
                body: req.body
            }

            channel.publish('kwetter', '', Buffer.from(JSON.stringify(data)))
            console.log('Message sent to queue')
            res.send('Message sent: ' + JSON.stringify(data))
        })

        app.listen(PORT, () => console.log('Server running on port ' + PORT))
    })
})

