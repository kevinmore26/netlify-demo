const express = require("express");
const serverless = require("serverless-http");
const app = express();
const axios = require("axios");
const router = express.Router();
app.use(express.json());
let records = [];
// const listAllStoresRecursive = async (info, offset = 0, allData = "") => {
//   try {
//     const { data } = await axios.get(
//       `https://api.cloudmediapro.com/api/appecwid/resellerapi/v1/stores?key=OunTpHSfEKXG1iE&order=email_desc&limit=100&offset=${offset}`,
//       info
//     );
//     // Verificar si la respuesta contiene la etiqueta <stores>.
//     if (!data.includes("<stores>")) {
//       // La respuesta no contiene <stores>, lo que indica que no hay más datos.
//       return `<root>${allData}</root>`;
//     }
//     // Si no hay datos en la respuesta, también debemos salir de la recursión.
//     if (data.length === 0) {
//       return `<root>${allData}</root>`;
//     }
//     // Agregar los datos XML a la cadena acumulada.
//     allData += data;
//     // Calcular el siguiente offset y limit.
//     offset += 100; // Puedes ajustar esto según sea necesario.
//     const limit = 100; // Puedes ajustar esto según sea necesario.
//     // Llamada recursiva con el siguiente offset y limit.
//     return listAllStoresRecursive(info, offset, allData);
//   } catch (error) {
//     console.log(error);
//     return `<root>${allData}</root>`;
//   }
// };
// const getOrdersByOrderID = async (orderID, info) => {
//   try {
//     const { data } = await axios.get(
//       `https://app.ecwid.com/api/v3/91510605/orders?ids="${orderID}"`,
//       {
//         headers: {
//           Authorization: "Bearer secret_jy28PPEJfGxYqYGG5sAkRuXrHaxd7kzv",
//           accept: "application/json",
//         },
//         // Puedes agregar parámetros adicionales aquí si es necesario
//       },
//       info
//     );
//     // Aquí puedes manejar la respuesta exitosa, como imprimir los datos
//     return data.items[0];
//   } catch (error) {
//     // Aquí puedes manejar errores en la solicitud
//     console.error(error);
//     return null; // Opcional: puedes devolver un valor predeterminado en caso de error
//   }
// };
// const emailshelpUser = async (info) => {
//   try {
//     const { data } = await axios.post(
//       `https://datapayments.cloudmediapro.com/api/correo-helps?populate=*`,
//       info
//     );
//     return data.data;
//   } catch (error) {
//     console.log(error);
//   }
// };
// const updateOrdersByOrderID = async (orderID, info) => {
//   try {
//     const { data } = await axios.put(
//       `https://app.ecwid.com/api/v3/91510605/orders/${orderID}`,
//       info,
//       {
//         headers: {
//           Authorization: "Bearer secret_jy28PPEJfGxYqYGG5sAkRuXrHaxd7kzv",
//           accept: "application/json",
//         },
//         // Puedes agregar parámetros adicionales aquí si es necesario
//       }
//     );
//     // Aquí puedes manejar la respuesta exitosa, como imprimir los datos
//     return data;
//   } catch (error) {
//     if (error.response) {
//       error.details = {
//         status: error.response.status,
//         data: error.response.data,
//       };
//     }
//     return error;
//   }
// };
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
  console.log(webhookData);
  res
    .status(200)
    .send("saddasdasdsaasdasd");
});
router.post("/webhook-ecwid", async (req, res) => {
  console.log("Datos del webhook recibidos:");
  const webhookData = req.body;
  console.log(webhookData);
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
 
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
