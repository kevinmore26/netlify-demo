// This is your test secret API key.

const express = require("express");
const app = express();
const router = express.Router();
const serverless = require("serverless-http");
app.use(express.static("public"));

const YOUR_DOMAIN = "http://localhost:4242";

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

    // Aquí puedes acceder a la información del pago, como el monto, la moneda, etc.
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
  console.log(webhookData);
});

router.post("/webhook-airplaneballoons", async (req, res) => {});
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
