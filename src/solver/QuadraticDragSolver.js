const { ISolver } = require('./ISolver');
const { SimulationState } = require('../domain/SimulationState');

class QuadraticDragSolver extends ISolver {
  solve(parameters) {
    const states = [];
    let time = 0;
    let height = parameters.initialHeight;
    let velocity = parameters.initialVelocity;
    const timeStep = parameters.timeStep;
    const dragFactor = (0.5 * parameters.dragCoefficient * parameters.fluidDensity * parameters.referenceArea)
      / parameters.mass;

    states.push(new SimulationState(time, height, velocity));

    while (height > 0) {
      const dragAcceleration = -dragFactor * velocity * Math.abs(velocity);
      const acceleration = -parameters.gravity + dragAcceleration;

      velocity = velocity + acceleration * timeStep;
      height = height + velocity * timeStep;
      time = time + timeStep;

      const clampedHeight = height < 0 ? 0 : height;
      states.push(new SimulationState(time, clampedHeight, velocity));

      if (clampedHeight === 0) {
        break;
      }
    }

    return states;
  }
}

module.exports = { QuadraticDragSolver };