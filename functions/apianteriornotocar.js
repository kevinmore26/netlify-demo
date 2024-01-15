const express = require("express");
const serverless = require("serverless-http");
const app = express();
const axios = require("axios");
const router = express.Router();
app.use(express.json());
let records = [];
const listAllStoresRecursive = async (info, offset = 0, allData = "") => {
  try {
    const { data } = await axios.get(
      `https://api.cloudmediapro.com/api/appecwid/resellerapi/v1/stores?key=OunTpHSfEKXG1iE&order=email_desc&limit=100&offset=${offset}`,
      info
    );

    // Verificar si la respuesta contiene la etiqueta <stores>.
    if (!data.includes("<stores>")) {
      // La respuesta no contiene <stores>, lo que indica que no hay más datos.
      return `<root>${allData}</root>`;
    }

    // Si no hay datos en la respuesta, también debemos salir de la recursión.
    if (data.length === 0) {
      return `<root>${allData}</root>`;
    }

    // Agregar los datos XML a la cadena acumulada.
    allData += data;

    // Calcular el siguiente offset y limit.
    offset += 100; // Puedes ajustar esto según sea necesario.
    const limit = 100; // Puedes ajustar esto según sea necesario.

    // Llamada recursiva con el siguiente offset y limit.
    return listAllStoresRecursive(info, offset, allData);
  } catch (error) {
    console.log(error);
    return `<root>${allData}</root>`;
  }
};
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
  console.log(webhookData.data.object_owner);
  if (
    webhookData.data.object_owner == "latienditadeluly1@gmail.com" &&
    webhookData.event == "transaction_updated"
  ) {
    const metadata = webhookData.data.metadata;
    // Usa una expresión regular para extraer todos los números de "metadata"
    const orderNumbers = metadata.match(/\d+/g);
    if (orderNumbers) {
      // Obtiene la información de la orden
      const orden = await getOrdersByOrderID(orderNumbers); // Supongamos que solo hay un número de orden

      if (!orden) {
        console.log("Error al obtener la información de la orden.");
        const emailhelp = await emailshelpUser({
          data: {
            tituloCorreo: `Error al obtener la información de la orden. #${orderNumbers}`,
            correoAdmin: `kevin@cloudmediapro.com`,
            correoUser: `kevin@cloudmediapro.com`,
            nombreApellido: `ERROR`,
            descripcionCorreo: `Error al obtener la información de la orden.`,
            subjectEmail: `Error al obtener la información de la orden.`,
          },
        });
        return res
          .status(500)
          .send("Error al obtener la información de la orden.");
      }
      let ordenCambiada = false;
      // Actualiza el estado de cumplimiento según el estado de envío
      if (
        webhookData.data.tracking_status == "PRE_TRANSIT" ||
        webhookData.data.tracking_status == "TRANSIT" ||
        webhookData.data.tracking_status == "UNKNOWN"
      ) {
        ordenCambiada = true;
        orden.fulfillmentStatus = "SHIPPED";
      } else if (webhookData.data.tracking_status == "DELIVERED") {
        ordenCambiada = true;
        orden.fulfillmentStatus = "DELIVERED";
      } else if (webhookData.data.tracking_status == "RETURNED") {
        ordenCambiada = true;
        orden.fulfillmentStatus = "RETURNED";
      }
      orden.trackingNumber = webhookData.data.tracking_number;

      // Realiza la actualización de laorden 
      console.log(orderNumbers, "orderNumbers");
      console.log(webhookData.data, "orden");
      console.log(orderNumbers, "orderNumbers");
      //console.log(orden);
      console.log(webhookData.data.tracking_number);
      if (ordenCambiada) {
        // Realiza la actualización de la orden solo si es necesario


        // ------------------------------------------------------------------------------
       // const actualizar = await updateOrdersByOrderID(orden.internalId, orden);
        if (!actualizar.details) {
          console.log("Orden actualizada con éxito.");
          return res.status(200).send("Orden actualizada con éxito.");
        } else {
          const emailhelp = await emailshelpUser({
            data: {
              tituloCorreo: `Hubo un error al actualizar la orden #${orderNumbers}`,
              correoAdmin: `kevin@cloudmediapro.com`,
              correoUser: `kevin@cloudmediapro.com`,
              nombreApellido: `ERROR`,
              descripcionCorreo: `Error ${actualizar.details.status}- ERROR CODE:  ${actualizar.details.data.errorCode}, Error Message ${actualizar.details.data.errorMessage}`,
              subjectEmail: `Hubo un error al actualizar la orden #${orderNumbers} con status  ${actualizar.details.data.errorCode}`,
            },
          });
          console.log("Error al actualizar la orden.");
          return res.status(500).send("Error al actualizar la orden.");
        }
      } else {
        // No se cumple la condición para actualizar
        console.log("No es necesario actualizar la orden.");
        return res.status(200).send("No es necesario actualizar la orden.");
      }
    } else {
      const emailhelp = await emailshelpUser({
        data: {
          tituloCorreo: `No se encontraron números de orden en la metadata. #${orderNumbers}`,
          correoAdmin: `kevin@cloudmediapro.com`,
          correoUser: `kevin@cloudmediapro.com`,
          nombreApellido: `ERROR`,
          descripcionCorreo: `No se encontraron números de orden en la metadata.`,
          subjectEmail: `No se encontraron números de orden en la metadata.`,
        },
      });
      console.log("No se encontraron números de orden en la metadata.");
      return res
        .status(400)
        .send("No se encontraron números de orden en la metadata.");
    }
  }

  console.log(
    "No se cumplió ninguna condición para la actualización de la orden."
  );
  res
    .status(200)
    .send("No se cumplió ninguna condición para la actualización de la orden.");
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
