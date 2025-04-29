const amqplib = require('amqplib');

const rabbitMQUrl = 'amqp://user:password@infoexpertise.hopto.org:5681';
const exchange = 'NRJN_exchange';

const resultQueue = 'NRJN_queue_result';

const args = process.argv.slice(2);
const operation = args[0];

const calculQueue = 'NRJN_queue_calcul_' + operation;
let channel;

async function receive() {
    // Connexion
    const connection = await amqplib.connect(rabbitMQUrl);

    // Création du channel
    channel = await connection.createChannel();

    // Assertion sur l'existence de l'exchange
    await channel.assertExchange(exchange, "direct", { durable: false });

    // Assertion sur l'existence de la queue
    await channel.assertQueue(calculQueue, { durable: false });

    // Bind de l'exchange vers la queue
    await channel.bindQueue(calculQueue, exchange, operation);

    console.log(` [*] Worker Addition en écoute sur la queue ${calculQueue}...`);

    // Reception du message
    channel.consume(calculQueue, consume);
}


async function consume(message) {
    const content = JSON.parse(message.content.toString());
    let a = parseInt(content.a);
    let b = parseInt(content.b);
    console.log(`Calcul à effectuer sur a : ${a} et b : ${b}`);
    let operation = content.operation;
    console.log(content);
    

    console.log(`operation ${operation} à effectuer sur ${a} et ${b}`);

    let resultat;
    switch(operation) {
        case "sum" :
            resultat = a + b;
            break;
        case "sub" :
            resultat = a - b;
            break;
        case "mul" : 
            resultat = a * b;
            break;
        case "div" :
            resultat = (b !== 0) ? (a / b) : "Erreur: division par zéro";
            break;
        default :
            resultat = "erreur operation";
    }

    console.log(`Résultat calculé : ${resultat}`);

    channel.ack(message)


    let result = a + b;

    // let resultatQueue = `NRJN_queue_result_${operation}`;

    // // Assurer que la queue existe
    // await channel.assertQueue(resultatQueue, { durable: false });

    // setTimeout(() => {
    //     // Envoyer dans la bonne queue
    //     channel.sendToQueue(resultatQueue, Buffer.from(JSON.stringify({
    //         a,
    //         b,
    //         result: resultat,
    //         op: operation
    //     })));

    //     console.log(`[✓] Résultat envoyé vers ${resultatQueue}`);
    //     channel.ack(message); // Ack du message après traitement
    // }, delay);
    

    // Assertion sur l'existence de la queue
    // await channel.assertQueue(resultQueue, { durable: false });

    // // Envoi du resultat
    // // channel.publish(exchange, operation, Buffer.from(JSON.stringify(result)));
    // channel.sendToQueue(resultQueue, Buffer.from(JSON.stringify({
    //     a,
    //         b,
    //         result,
    //         op: "add"
    //     })));


    const delay = 
    // Math.floor(Math.random() * 10000) +
     5000;
    
    // setTimeout(() => {
    //     console.log(`resultat : ${result}`);

    //     channel.sendToQueue(resultQueue, Buffer.from(JSON.stringify({
    //         a,
    //         b,
    //         result,
    //         op: "add"
    //     })));

    //     channel.ack(message);
    // }, 5000);
}

receive();