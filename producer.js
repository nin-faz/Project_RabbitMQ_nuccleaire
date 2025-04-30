const amqplib = require("amqplib");
const inquirer = require("inquirer");

const rabbitMQUrl = "amqp://user:password@infoexpertise.hopto.org:5681";
const exchange = "NRJN_exchange";
const ALL_OPERATIONS = ["sum", "sub", "mul", "div", "all"];

let connection;
let channel;

async function connectToRabbit() {
  connection = await amqplib.connect(rabbitMQUrl);
  channel = await connection.createChannel();
  await channel.assertExchange(exchange, "direct", { durable: false });
}

async function sendNumber() {
  const operation =
    ALL_OPERATIONS[Math.floor(Math.random() * ALL_OPERATIONS.length)];

  console.log(`Operation à envoyer : ${operation}`);

  const a = Math.floor(Math.random() * 1000);
  const b = Math.floor(Math.random() * 1000);
  const content = {
    a: a,
    b: b,
    operation: operation,
  };

  // Envoi du message
  channel.publish(exchange, operation, Buffer.from(JSON.stringify(content)));
  console.log(`Calcul envoyé : ${JSON.stringify(content)}`);

  // Fermeture propre après l'envoi
  //   setTimeout(() => connection.close(), 1000);
}

async function runManualProducer() {
  const { operation, a, b } = await inquirer.prompt([
    {
      type: "list",
      name: "operation",
      message: "Choisissez une opération :",
      choices: ALL_OPERATIONS,
    },
    {
      type: "input",
      name: "a",
      message: "Entrez le nombre a :",
      validate: (val) => !isNaN(val) || "Nombre invalide",
    },
    {
      type: "input",
      name: "b",
      message: "Entrez le nombre b :",
      validate: (val) => !isNaN(val) || "Nombre invalide",
    },
  ]);

  const content = {
    a: parseInt(a),
    b: parseInt(b),
    operation,
  };

  const keys = operation === "all" ? ["sum", "sub", "mul", "div"] : [operation];

  // Envoi des messages
  for (const key of keys) {
    channel.publish(exchange, key, Buffer.from(JSON.stringify(content)));
    console.log(`Envoyé vers "${key}": ${JSON.stringify(content)}`);
  }

  setTimeout(() => {
    runManualProducer();
  }, 500);
}

const useManualMode = process.argv.includes("--manual");

(async () => {
  await connectToRabbit();

  if (useManualMode) {
    await runManualProducer(); // pour bien attendre et éviter les bugs
  } else {
    setInterval(sendNumber, 5000);
  }
})();
