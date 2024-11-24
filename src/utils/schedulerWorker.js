const { parentPort, workerData } = require('worker_threads')
const { SimulatedAnnealingScheduler } = require('./simulatedAnnealing')

// Worker parameters based on worker ID
const getWorkerParams = (workerId) => ({
  initialTemp: 100 * (1 + workerId * 0.5),
  coolingRate: 0.95 - (workerId * 0.01),
  minTemp: 0.1,
  iterationsPerTemp: 100 + (workerId * 25)
})

// Listen for messages from main thread
parentPort.on('message', (data) => {
  const {
    classes,
    startDate,
    constraints,
    preferences,
    blackoutPeriods
  } = data

  // Create scheduler with worker-specific parameters
  const scheduler = new SimulatedAnnealingScheduler(
    classes,
    new Date(startDate),
    constraints,
    preferences,
    blackoutPeriods,
    getWorkerParams(workerData.id)
  )

  // Generate schedule
  const schedule = scheduler.generateSchedule()

  // Send result back to main thread
  parentPort.postMessage({
    type: 'result',
    schedule,
    workerId: workerData.id
  })
})
