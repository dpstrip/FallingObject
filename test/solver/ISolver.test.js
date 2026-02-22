const test = require('node:test');
const assert = require('node:assert/strict');
const { ISolver } = require('../../src/solver/ISolver');

test('ISolver.solve throws when not implemented', () => {
  const solver = new ISolver();

  assert.throws(
    () => solver.solve({}),
    /Method solve\(parameters\) must be implemented\./
  );
});
