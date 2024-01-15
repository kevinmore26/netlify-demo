// This is your test secret API key.

const express = require("express");
const app = express();
const axios = require("axios");
const router = express.Router();
const serverless = require("serverless-http");
app.use(express.static("public"));

const YOUR_DOMAIN = "http://localhost:4242";
const getProductByOrderID = async (storeID, productID, info) => {
  try {
    const { data } = await axios.get(
      `https://api.cloudmediapro.com/api/appecwid/api/v3/${storeID}/products/${productID}`,
      {
        headers: {
          Authorization: "Bearer secret_7ExVgwX5zn1hzL8uChi1JuGeT4Lr3qn3",
          accept: "application/json",
        },
        info,
        //CAMBIAR EL BEARER AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        // Puedes agregar parámetros adicionales aquí si es necesario
      }
    );
    // Aquí puedes manejar la respuesta exitosa, como imprimir los datos

    return data;
  } catch (error) {
    // Aquí puedes manejar errores en la solicitud
    console.error(error);
    return null; // Opcional: puedes devolver un valor predeterminado en caso de error
  }
};
const updateProductByOrderID = async (storeID, productID, info) => {
  try {
    const { data } = await axios.put(
      `https://api.cloudmediapro.com/api/appecwid/api/v3/${storeID}/products/${productID}`,
      info,
      {
        headers: {
          Authorization: "Bearer secret_7ExVgwX5zn1hzL8uChi1JuGeT4Lr3qn3",
          accept: "application/json",
        },
        // Puedes agregar parámetros adicionales aquí si es necesario
      }
    );
    // Aquí puedes manejar la respuesta exitosa, como imprimir los datos
    return data;
  } catch (error) {
    if (error.response) {
      error.details = {
        status: error.response.status,
        data: error.response.data,
      };
    }
    return error;
  }
};
router.post("/create-checkout-session", async (req, res) => {
  const requestBody = JSON.parse(req.body.toString("utf-8"));
  console.log(requestBody);
  console.log(requestBody.apiKey);
  const apiKeyFromFrontend = requestBody.apiKey;
  const urlactual = requestBody.urlactual;
  console.log(apiKeyFromFrontend);
  // Usar la clave API del frontend para realizar acciones con Stripe
  const stripe = require("stripe")(apiKeyFromFrontend);

  const product = await stripe.products.create({
    name: "Importe",
  });
  const price = await stripe.prices.create({
    currency: "usd",
    custom_unit_amount: {
      enabled: true,
    },
    product: product.id,
  });
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    // redirect_on_completion: "never",
    return_url: `${urlactual}/state/{CHECKOUT_SESSION_ID}`,
    billing_address_collection: "auto",
  });

  res.send({ clientSecret: session.client_secret });
});

router.get("/session-status", async (req, res) => {
  const apiKeyFromFrontend = req.query.apiKey;
  console.log(req.query);
  console.log(req.query.apiKey);
  const stripe = require("stripe")(apiKeyFromFrontend);

  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.sessionId
    );
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent
    );

    // Aquí puedes acceder a la rmación del pago, como el monto, la moneda, etc.
    const amount = paymentIntent.amount;
    const currency = paymentIntent.currency;
    const payment_intent = paymentIntent.payment_intent;
    res.send({
      status: session.status,
      customer_email: session.customer_details.email,
      amount,
      currency,
      payment_intent,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/webhook-pets", async (req, res) => {
  const webhookData = req.body;
  const jsonString = Buffer.from(webhookData, "hex").toString("utf-8");

  // Parsea la cadena de texto a un objeto JSON
  const jsonObject = JSON.parse(jsonString);
  const product = await getProductByOrderID(
    jsonObject.storeId,
    jsonObject.entityId
  );
  if (product.quantity <= 3) {
    console.log("El stock es menor o igual a 3, se pone fuera de stock.");
    product.inStock = false;
    product.enabled = false;
  } else {
    product.enabled = true;
  }

  console.log(product, "productoJSON");

  // Actualizar el producto
  const actualizar = await updateProductByOrderID(
    jsonObject.storeId,
    jsonObject.entityId,
    product
  );
  console.log(actualizar, "peticionactualizar");
  res.json({ message: "Webhook recibido con éxito", data: jsonObject });
});

router.post("/webhook-airplaneballoons", async (req, res) => {
  // const webhookData = req.body;
  // const jsonString = Buffer.from(webhookData, "hex").toString("utf-8");

  // // Parsea la cadena de texto a un objeto JSON
  // const jsonObject = JSON.parse(jsonString);
  // const product = await getProductByOrderID(
  //   jsonObject.storeId,
  //   jsonObject.entityId
  // );
  // if (product.quantity <= 3) {
  //   console.log("El stock es menor o igual a 3, se pone fuera de stock.");
  //   product.inStock = false;
  //   product.enabled = false;
  // } else {
  //   product.enabled = true;
  // }

  // console.log(product, "productoJSON");

  // // Actualizar el producto
  // const actualizar = await updateProductByOrderID(
  //   jsonObject.storeId,
  //   jsonObject.entityId,
  //   product
  // );
  // console.log(actualizar, "peticionactualizar");
  // res.json({ message: "Webhook recibido con éxito", data: jsonObject });
});
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
