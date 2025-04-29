const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const exchange = 'NRJN_exchange';

const arg = process.argv.slice(2);
const routingKey = arg[0];

let queue;

async function consumeResult() {
    const connection = await amqplib.connect(rabbitMQUrl);

    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: false });

    queue = await channel.assertQueue('', { durable: false, expires:  60000 });

    process.on('SIGINT', async () => {
        await channel.cancel(queue.queue)
        await channel.deleteQueue(queue.queue);
        process.exit(0);
    })

    await channel.bindQueue(queue.queue, exchange, routingKey);

    channel.consume(queue.queue, (msg) => {
        if (msg !== null) {
            console.log(`Received message from ${routingKey}: ${msg.content.toString()}`);
            channel.ack(msg);
        }
    });
}

consumeResult();