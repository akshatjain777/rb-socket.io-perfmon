const mongoose = require('mongoose');

const Machine = require('./models/Machine');

const MONGO_URI = 'MONGO_URI';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const socketMain = (io, socket) => {
  let macA;
  socket.on('clientAuth', (key) => {
    if (key === '5asbdyabcas737gsd7754a3') {
      // Validated
      socket.join('clients');
    } else if (key === 'iubdasbydbq35545') {
      // Valid UI Client
      socket.join('ui');
      console.log('React Client Joined');
      Machine.find({}, (err, docs) => {
        docs.forEach((machine) => {
          machine.isActive = false;
          io.to('ui').emit('data', machine);
        });
      });
    } else {
      // Invalid Client
      socket.disconnect(true);
    }
  });

  socket.on('disconnect', () => {
    Machine.find({ macA: macA }, (err, docs) => {
      if (docs.length > 0) {
        docs[0].isActive = false;
        io.to('ui').emit('data', docs[0]);
      }
    });
  });

  socket.on('initPerfData', async (data) => {
    macA = data.macA;
    // Mongoose Integration
    const mongooseResponse = await checkAndAdd(data);
    console.log(mongooseResponse);
  });

  socket.on('perfData', (data) => {
    io.to('ui').emit('data', data);
  });
};

const checkAndAdd = (data) => {
  return new Promise((resolve, reject) => {
    Machine.findOne({ macA: data.macA }, (err, doc) => {
      if (err) {
        reject(err);
      } else if (doc === null) {
        const machine = new Machine(data);
        machine.save();
        resolve('added');
      } else {
        resolve('found');
      }
    });
  });
};

module.exports = socketMain;
