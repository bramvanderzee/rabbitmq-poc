const express = require('express');
const amqp = require('amqplib');
const app = express();
const PORT = 3000;

var channel, connection;

function sleep(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
}

connectQueue();
async function connectQueue() {
	await sleep(5000);
	try {
		connection = await amqp.connect("amqp://rabbitmq:5672");
		channel = await connection.createChannel();

		await channel.assertQueue('test-queue');
	} catch(err) {
		console.log(err);
	}
}

async function sendData(data) {
	await channel.sendToQueue('test-queue', Buffer.from(JSON.stringify(data)));
}

app.use(express.json());

app.get('/send-msg', (req, res) => {
	const data = {
		body: req.body
	}

	sendData(data);
	console.log('Message sent to queue');
	res.send('Message sent.');
});

app.listen(PORT, () => console.log('Server running on port ' + PORT))
