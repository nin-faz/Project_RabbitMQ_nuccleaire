// const amqplib = require('amqplib');

// const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
// const exchange = 'NRJN_exchange';

// const operation = 'all';
// const calculQueue = 'NRJN_queue_calcul_' + operation;
// const TARGET_OPERATIONS = ['sum', 'sub', 'mul', 'div'];

// let channel;

// async function receive() {
//     // Connexion
//     const connection = await amqplib.connect(rabbitMQUrl);

//     // Création du channel
//     channel = await connection.createChannel();

//     // Assertion sur l'existence de l'exchange
//     await channel.assertExchange(exchange, "direct", { durable: false });

//     // Assertion sur l'existence de la queue
//     await channel.assertQueue(calculQueue, { durable: false });

//     // Bind de l'exchange vers la queue
//     await channel.bindQueue(calculQueue, exchange, operation);

//     console.log(`Calcul en écoute sur la queue ${calculQueue}...`);

//     // Reception du message
//     channel.consume(calculQueue, consume);
// }

// async function consume(message) {   
    
// }

// receive();


// workerAll.js
const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const exchange = 'NRJN_exchange';

const operation = 'all';
const calculQueue = 'NRJN_queue_calcul_' + operation;
const TARGET_OPERATIONS = ['sum', 'sub', 'mul', 'div'];

let channel;

async function receive() {
    const connection = await amqplib.connect(rabbitMQUrl);
    channel = await connection.createChannel();

    await channel.assertExchange(exchange, "direct", { durable: false });
    await channel.assertQueue(calculQueue, { durable: false });
    await channel.bindQueue(calculQueue, exchange, operation);

    console.log(` [*] Worker ALL en écoute sur ${calculQueue}...`);

    channel.consume(calculQueue, consume);
}

async function consume(message) {
    const content = JSON.parse(message.content.toString());
    const { a, b } = content;

    console.log(` [x] Dispatch ALL : a=${a}, b=${b} vers [sum, sub, mul, div]`);

    for (const op of TARGET_OPERATIONS) {
        const newMsg = {
            a,
            b,
            operation: op
        };

        channel.publish(exchange, op, Buffer.from(JSON.stringify(newMsg)));
        console.log(`    ↳ Envoyé vers operation ${op}`);
    }

    channel.ack(message);
}

receive();
