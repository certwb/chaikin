import assert from 'node:assert';
import { chaikinStep } from './chaikin.js';

function runTests() {
    console.log("Running unit tests for Chaikin's Algorithm...");

    // Edge cases without crashing
    assert.deepStrictEqual(chaikinStep([]), [], "Failed on 0 points");
    assert.deepStrictEqual(chaikinStep([{x: 10, y: 10}]), [{x: 10, y: 10}], "Failed on 1 point");
    assert.deepStrictEqual(chaikinStep([{x: 0, y: 0}, {x: 100, y: 100}]), [{x: 0, y: 0}, {x: 100, y: 100}], "Failed on 2 points");

    // Coordinates at 25% and 75%
    const points = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}];
    const expected = [
        {x: 25, y: 0},
        {x: 75, y: 0},
        {x: 100, y: 25},
        {x: 100, y: 75}
    ];
    assert.deepStrictEqual(chaikinStep(points), expected, "Failed checking coordinates at 25% and 75%");

    // Verify number of points increases correctly (N points -> 2N - 2 points)
    const points4 = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}];
    const step1 = chaikinStep(points4);
    assert.strictEqual(step1.length, 2 * points4.length - 2, "Failed on number of points for N=4");
    
    const points5 = [{x:0, y:0}, {x:10, y:0}, {x:20, y:10}, {x:30, y:0}, {x:40, y:20}];
    const step1_5 = chaikinStep(points5);
    assert.strictEqual(step1_5.length, 2 * points5.length - 2, "Failed on number of points for N=5");

    console.log("All unit tests passed perfectly!");
}

runTests();
