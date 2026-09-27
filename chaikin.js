export function chaikinStep(points) {
    if (points.length === 0) return [];
    if (points.length === 1) return [points[0]];
    if (points.length === 2) return points;

    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const qx = 0.75 * p1.x + 0.25 * p2.x;
        const qy = 0.75 * p1.y + 0.25 * p2.y;
        
        const rx = 0.25 * p1.x + 0.75 * p2.x;
        const ry = 0.25 * p1.y + 0.75 * p2.y;

        newPoints.push({ x: qx, y: qy });
        newPoints.push({ x: rx, y: ry });
    }
    return newPoints;
}

export function chaikin(points, steps) {
    if (steps === 0) return points;
    let current = points;
    for (let i = 0; i < steps; i++) {
        current = chaikinStep(current);
    }
    return current;
}
