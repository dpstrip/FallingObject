const { SimulationParameters } = require('../domain/SimulationParameters');
const { EulerCromerSolver } = require('../solver/EulerCromerSolver');
const { ValidationError } = require('../errors/ValidationError');

class FallingObjectSimulationService {
  constructor(solver = new EulerCromerSolver()) {
    this.solver = solver;
  }

  run(rawInputs) {
    const parameters = this.#createAndValidateParameters(rawInputs);
    const states = this.solver.solve(parameters);

    return {
      equation: "h''(t) = -g",
      states
    };
  }

  #createAndValidateParameters(rawInputs) {
    const gravity = Number(rawInputs.gravity);
    const initialHeight = Number(rawInputs.initialHeight);
    const initialVelocityMagnitude = Number(rawInputs.initialVelocity);
    const timeStep = Number(rawInputs.timeStep);
    const velocityDirection = rawInputs.velocityDirection;

    if (!Number.isFinite(gravity) || gravity <= 0) {
      throw new ValidationError('Gravity must be a positive number.');
    }

    if (!Number.isFinite(initialHeight) || initialHeight < 0) {
      throw new ValidationError('Height must be a number greater than or equal to 0.');
    }

    if (!Number.isFinite(initialVelocityMagnitude) || initialVelocityMagnitude < 0) {
      throw new ValidationError('Initial velocity must be a number greater than or equal to 0.');
    }

    if (!Number.isFinite(timeStep) || timeStep <= 0) {
      throw new ValidationError('Time step must be a positive number.');
    }

    if (velocityDirection !== 'up' && velocityDirection !== 'down') {
      throw new ValidationError('Velocity direction must be either up or down.');
    }

    const signedVelocity = velocityDirection === 'up'
      ? initialVelocityMagnitude
      : -initialVelocityMagnitude;

    return new SimulationParameters({
      gravity,
      initialHeight,
      initialVelocity: signedVelocity,
      timeStep
    });
  }
}

module.exports = { FallingObjectSimulationService };
