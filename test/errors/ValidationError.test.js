const test = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError } = require('../../src/errors/ValidationError');

test('ValidationError has expected name and message', () => {
  const error = new ValidationError('Invalid input.');

  assert.equal(error.name, 'ValidationError');
  assert.equal(error.message, 'Invalid input.');
  assert.ok(error instanceof Error);
});
