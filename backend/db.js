const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:admin2008@cluster0.lru05.mongodb.net/ecom-dapp?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const PaymentSchema = new mongoose.Schema({
  id: String,
  itemId: String,
  paid: Boolean,
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment };
