const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

let records = [];

//Get all students
router.get("/", (req, res) => {
  res.send("App is running..");
});

//Create new record
router.post("/add", (req, res) => {
  res.send("New record added.");
});
router.post("/webhook-endpoint", async (req, res) => {
  console.log("Datos del webhook recibidos:");
  const webhookData = req.body;
  // Procesa los datos del webhook aquí
  console.log("Datos del webhook recibidos:", webhookData);
  // Realiza una solicitud POST a otro destino si es necesario

  // Enviar una respuesta JSON con el mensaje y datos adicionales
  res.json({ message: "Webhook recibido con éxito", data: webhookData });
});
//delete existing record
router.delete("/", (req, res) => {
  res.send("Deleted existing record");
});

//updating existing record
router.put("/", (req, res) => {
  res.send("Updating existing record");
});

//showing demo records
router.get("/demo", (req, res) => {
  res.json([
    {
      id: "001",
      name: "Smith",
      email: "smith@gmail.com",
    },
    {
      id: "002",
      name: "Sam",
      email: "sam@gmail.com",
    },
    {
      id: "003",
      name: "lily",
      email: "lily@gmail.com",
    },
  ]);
});

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
