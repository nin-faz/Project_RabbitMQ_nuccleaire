const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const exchange = 'NRJN_exchange';
const args = process.argv.slice(2);
const operation = args[0];
const ALL_OPERATIONS = ["sum", "sub", "mul", "div"];

if (!ALL_OPERATIONS.includes(operation)) {
    console.log(`Operation non reconnue : ${operation}`);
    process.exit(1)
}

const a = Math.floor(Math.random() * 1000);
const b = Math.floor(Math.random() * 1000);
const content = {
    a: a,
    b: b,
    operation: operation
};

async function sendNombre() {
    const connection = await amqplib.connect(rabbitMQUrl);

    const channel = await connection.createChannel();

    // Assertion sur l'existence de l'exchange
    await channel.assertExchange(exchange, "direct", { durable: false });

    // Envoi du message
    channel.publish(exchange, operation, Buffer.from(JSON.stringify(content)));

    console.log(`Calcul à envoyer : ${JSON.stringify(content)}`);

    // Fermeture de la connexion
    setTimeout(function () {
        connection.close();
        process.exit(0);
    }, 200);
}

sendNombre();
