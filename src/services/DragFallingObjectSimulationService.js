const { SimulationParameters } = require('../domain/SimulationParameters');
const { QuadraticDragSolver } = require('../solver/QuadraticDragSolver');
const { ValidationError } = require('../errors/ValidationError');

class DragFallingObjectSimulationService {
  constructor(solver = new QuadraticDragSolver()) {
    this.solver = solver;
  }

  run(rawInputs) {
    const parameters = this.#createAndValidateParameters(rawInputs);
    const states = this.solver.solve(parameters);

    return {
      equation: 'm dv/dt = m g - 1/2 Cd rho A v^2',
      terminalVelocity: this.#computeTerminalVelocity(parameters),
      states
    };
  }

  #createAndValidateParameters(rawInputs) {
    const gravity = Number(rawInputs.gravity);
    const initialHeight = Number(rawInputs.initialHeight);
    const initialVelocityMagnitude = Number(rawInputs.initialVelocity);
    const timeStep = Number(rawInputs.timeStep);
    const velocityDirection = rawInputs.velocityDirection;
    const mass = Number(rawInputs.mass);
    const dragCoefficient = Number(rawInputs.dragCoefficient);
    const fluidDensity = Number(rawInputs.fluidDensity);
    const referenceArea = Number(rawInputs.referenceArea);

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

    if (!Number.isFinite(mass) || mass <= 0) {
      throw new ValidationError('Mass must be a positive number.');
    }

    if (!Number.isFinite(dragCoefficient) || dragCoefficient <= 0) {
      throw new ValidationError('Drag coefficient must be a positive number.');
    }

    if (!Number.isFinite(fluidDensity) || fluidDensity <= 0) {
      throw new ValidationError('Fluid density must be a positive number.');
    }

    if (!Number.isFinite(referenceArea) || referenceArea <= 0) {
      throw new ValidationError('Reference area must be a positive number.');
    }

    const signedVelocity = velocityDirection === 'up'
      ? initialVelocityMagnitude
      : -initialVelocityMagnitude;

    return new SimulationParameters({
      gravity,
      initialHeight,
      initialVelocity: signedVelocity,
      timeStep,
      mass,
      dragCoefficient,
      fluidDensity,
      referenceArea
    });
  }

  #computeTerminalVelocity(parameters) {
    return Math.sqrt(
      (2 * parameters.mass * parameters.gravity)
      / (parameters.dragCoefficient * parameters.fluidDensity * parameters.referenceArea)
    );
  }
}

module.exports = { DragFallingObjectSimulationService };