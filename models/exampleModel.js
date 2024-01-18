// models/exampleModel.js
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false }
});

const Example = mongoose.model('Example', exampleSchema);

module.exports = Example;
