class SimulationParameters {
  constructor({ gravity, initialHeight, initialVelocity, timeStep }) {
    this.gravity = gravity;
    this.initialHeight = initialHeight;
    this.initialVelocity = initialVelocity;
    this.timeStep = timeStep;
  }
}

module.exports = { SimulationParameters };
