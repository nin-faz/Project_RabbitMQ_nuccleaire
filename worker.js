const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const exchange = 'NRJN_exchange';

const args = process.argv.slice(2);
const operation = args[0];

const calculQueue = 'NRJN_queue_calcul_' + operation;
const resultatQueue = 'NRJN_queue_result_' + operation;

let channel;
const delay = Math.floor(Math.random() * 10000) + 5000;

async function receive() {
    const connection = await amqplib.connect(rabbitMQUrl);
    channel = await connection.createChannel();

    await channel.assertExchange(exchange, "direct", { durable: false });

    await channel.assertQueue(calculQueue, { 
        durable: false,
    });
    await channel.assertQueue(resultatQueue, { durable: false });

    await channel.bindQueue(calculQueue, exchange, operation);
    await channel.bindQueue(calculQueue, exchange, 'all');

    console.log(`[*] Worker "${operation}" en écoute sur la queue ${calculQueue}...`);

    channel.consume(calculQueue, consume);
}

async function consume(message) {
    const content = JSON.parse(message.content.toString());
    const { a, b, operation: incomingOp } = content;

    console.log(`→ [${operation}] Reçu : ${JSON.stringify(content)}`);

    if (incomingOp === operation || incomingOp === 'all') {
        let resultat;
        switch (operation) {
            case "sum": 
                resultat = a + b; 
                break;
            case "sub": 
                resultat = a - b; 
                break;
            case "mul": 
                resultat = a * b; 
                break;
            case "div": 
                resultat = (b !== 0) ? (a / b) : "Erreur: division par zéro"; 
                break;
            default: 
                resultat = "Erreur: opération inconnue";
        }

        setTimeout(() => {
            const payload = {
                a,
                b,
                result: resultat,
                op: operation
            };

            channel.sendToQueue(resultatQueue, Buffer.from(JSON.stringify(payload)));
            console.log(`[✓] [${operation}] Résultat envoyé : ${JSON.stringify(payload)}`);
            channel.ack(message);
        }, delay);
    } else {
        channel.nack(message, false, true);
    }
}

receive();
