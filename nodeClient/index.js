const os = require('os');
const io = require('socket.io-client');
const socket = io('http://localhost:8181');

socket.on('connect', () => {
  const nI = os.networkInterfaces();
  let macA;
  for (let key in nI) {
    if (!nI[key][0].internal) {
      macA = nI[key][0].mac;
      break;
    }
  }

  socket.emit('clientAuth', '5asbdyabcas737gsd7754a3');

  performanceData().then((allPerformanceData) => {
    allPerformanceData.macA = macA;
    socket.emit('initPerfData', allPerformanceData);
  });

  let perDataInterval = setInterval(() => {
    performanceData().then((allPerformanceData) => {
      allPerformanceData.macA = macA;
      socket.emit('perfData', allPerformanceData);
    });
  }, 1000);
  socket.on('disconnect', () => {
    clearInterval(perDataInterval);
  });
});

const performanceData = () => {
  return new Promise(async (resolve, reject) => {
    const cpus = os.cpus();

    const osType = os.type();
    const upTime = os.uptime();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    const usedMem = totalMem - freeMem;
    const memUsage = Math.floor((usedMem / totalMem) * 100) / 100;

    const cpuModel = cpus[0].model;
    const cpuSpeed = cpus[0].speed;
    const numCores = cpus.length;

    const isActive = true;

    const cpuLoad = await getCpuLoad();
    resolve({
      freeMem,
      totalMem,
      usedMem,
      memUsage,
      osType,
      upTime,
      cpuModel,
      numCores,
      cpuSpeed,
      cpuLoad,
      isActive,
    });
  });
};

const cpuAverage = () => {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;
  cpus.forEach((core) => {
    for (const type in core.times) {
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  });
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length,
  };
};

const getCpuLoad = () => {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      const percentageCpu =
        100 - Math.floor((100 * idleDifference) / totalDifference);
      resolve(percentageCpu);
    }, 100);
  });
};
