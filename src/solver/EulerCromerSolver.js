const { ISolver } = require('./ISolver');
const { SimulationState } = require('../domain/SimulationState');

class EulerCromerSolver extends ISolver {
  solve(parameters) {
    const states = [];
    let time = 0;
    let height = parameters.initialHeight;
    let velocity = parameters.initialVelocity;
    const acceleration = -parameters.gravity;
    const timeStep = parameters.timeStep;

    states.push(new SimulationState(time, height, velocity));

    while (height > 0) {
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

module.exports = { EulerCromerSolver };
