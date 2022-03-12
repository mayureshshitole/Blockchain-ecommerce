const koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const ethers = require("ethers");
const { v4: uuidv4 } = require("uuid");
const PaymentProcessor = require("../frontend/src/contracts/PaymentProcessor.json");
const { Payment } = require("./db.js");

const app = new koa();
const router = new Router();

const items = {
  1: { id: "1", url: "http://urldownload1" },
  2: { id: "2", url: "http://urldownload2" },
};

router.get("/api/getPaymentId/:itemId", async (ctx) => {
  const paymentId = uuidv4();
  console.log(`unique payment id is ${paymentId}`);

  await Payment.create({
    id: paymentId,
    itemId: ctx.params.itemId,
    paid: false,
  });
  ctx.body = { paymentId };
});

router.get("/api/getItemUrl/:paymentId", async (ctx) => {
  const payment = await Payment.findOne({ id: ctx.params.paymentId });

  if (payment && payment.paid == true) {
    ctx.body = { url: items[payment.itemId].url };
  } else {
    ctx.body = { url: "" };
  }
});

app.use(cors()).use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("Listening on port no 4000");
});

//listen to payment in contracts to update payment details in mongodb

const listenToEvents = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:9545"
  );
  const networkId = "5777";
 
  const paymentProcessor = new ethers.Contract(
    PaymentProcessor.networks[networkId].address,
    PaymentProcessor.abi,
    provider
  );

  paymentProcessor.on("PaymentDone", async (payer, amount, paymentId, date) => {
    console.log(`
      from ${payer}
      amount ${amount}
      paymentId ${paymentId}
      date ${new Date(date.toNumber() * 1000).toLocaleString()}`);

    const payment = await Payment.findOne({ id: paymentId });
    if (payment) {
      payment.paid = true;
      await payment.save();
    }
  });
};
listenToEvents();
