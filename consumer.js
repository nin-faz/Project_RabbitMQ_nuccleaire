const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const operations = ['sum', 'sub', 'mul', 'div'];

async function consumeResult() {
    const connection = await amqplib.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    for (const op of operations) {
        const queueName = `NRJN_queue_result_${op}`;
        await channel.assertQueue(queueName, { 
            durable: false,
        });

        channel.consume(queueName, msg => {
            const content = JSON.parse(msg.content.toString());
            const resultJson = {
                a: content.a,
                b: content.b,
                result: content.result,
                op: op
            };
            console.log(resultJson)
            channel.ack(msg);
        });

    }
}

consumeResult();
