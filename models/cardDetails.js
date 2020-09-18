const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/local');

const Schema = mongoose.Schema;
const CardDetail = new Schema({
      userName : String,
      cardholder: String,
      expdate: String,
      cvv: String,
      cardno : String
    });
    const CardDetails = mongoose.model('CardInfo', CardDetail, 'CardInfo');

module.exports = CardDetails;