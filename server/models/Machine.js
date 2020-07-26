const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const machineSchema = new Schema({
  macA: String,
  cpuLoad: Number,
  freeMem: Number,
  totalMen: Number,
  usedMem: Number,
  memUsage: Number,
  osType: String,
  upTime: Number,
  cpuModel: String,
  numCores: Number,
  cpuSpeed: Number,
});

module.exports = mongoose.model('Machine', machineSchema);
