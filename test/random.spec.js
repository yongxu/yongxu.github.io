import expect from 'expect'
import {
  mod,
  randomList,
  nonLinearInterpellationGenerator
} from '../src/utils/random'

describe('random.js', function() {

  it('mod works', function() {
    expect(mod(1, 3)).toBe(1)
    expect(mod(0.5, 6)).toBe(0.5)
    expect(mod(-1.0, 3)).toBe(2.0)
    expect(mod(5, 3)).toBe(2)
    expect(mod(3, 3)).toBe(0)
  })
  it('randomList, dim1', function() {
    const d1 = randomList(10, -1.0, 1.0, 1)
    expect(d1.length).toBe(10)
    d1.map(v => expect(v).toBeGreaterThanOrEqualTo(-1.0).toBeLessThanOrEqualTo(1.0))
  });
  it('randomList, dim2', function() {
    const d2 = randomList(20) // default
    expect(d2.length).toBe(20)
    d2.map(v => {
      expect(v.length).toBe(2)
      expect(v[0]).toBeGreaterThanOrEqualTo(-1.0).toBeLessThanOrEqualTo(1.0)
      expect(v[1]).toBeGreaterThanOrEqualTo(-1.0).toBeLessThanOrEqualTo(1.0)
    })
  });

  it('nonLinearInterpellationGenerator, dim1', function() {
    const nonLinearInterpellation = nonLinearInterpellationGenerator([0, 1, 2, 3, 4, 5])
    expect(nonLinearInterpellation(0)).toBe(0)
    expect(nonLinearInterpellation(0.5)).toBe(0.5)
    expect(nonLinearInterpellation(5)).toBe(5)
    expect(nonLinearInterpellation(6)).toBe(0)
    expect(nonLinearInterpellation(7)).toBe(1)
    expect(nonLinearInterpellation(1.5)).toBe(1.5)
    expect(nonLinearInterpellation(-1)).toBe(5)
    expect(nonLinearInterpellation(-1.5)).toBe(4.5)
    expect(nonLinearInterpellation(-7)).toBe(5)
  });

  it('nonLinearInterpellationGenerator, dim2', function() {
    const nonLinearInterpellation = nonLinearInterpellationGenerator([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5]
    ])
    expect(nonLinearInterpellation(0)[0]).toBe(0)
    expect(nonLinearInterpellation(0.5)[1]).toBe(0.5)
    expect(nonLinearInterpellation(5)[0]).toBe(5)
    expect(nonLinearInterpellation(6)[1]).toBe(0)
    expect(nonLinearInterpellation(7)[0]).toBe(1)
    expect(nonLinearInterpellation(1.5)[1]).toBe(1.5)
    expect(nonLinearInterpellation(-1)[0]).toBe(5)
    expect(nonLinearInterpellation(-1.5)[1]).toBe(4.5)
    expect(nonLinearInterpellation(-7)[0]).toBe(5)
  });

});
