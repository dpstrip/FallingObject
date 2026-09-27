class SimulationParameters {
  constructor({
    gravity,
    initialHeight,
    initialVelocity,
    timeStep,
    mass,
    dragCoefficient,
    fluidDensity,
    referenceArea
  }) {
    this.gravity = gravity;
    this.initialHeight = initialHeight;
    this.initialVelocity = initialVelocity;
    this.timeStep = timeStep;
    this.mass = mass;
    this.dragCoefficient = dragCoefficient;
    this.fluidDensity = fluidDensity;
    this.referenceArea = referenceArea;
  }
}

module.exports = { SimulationParameters };
