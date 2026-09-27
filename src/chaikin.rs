#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

pub fn chaikin_step(points: &[Point]) -> Vec<Point> {
    if points.is_empty() {
        return vec![];
    }
    if points.len() == 1 {
        return vec![points[0]];
    }
    if points.len() == 2 {
        return points.to_vec();
    }

    let mut new_points = Vec::with_capacity((points.len() - 1) * 2);

    for i in 0..points.len() - 1 {
        let p1 = points[i];
        let p2 = points[i + 1];

        let qx = 0.75 * p1.x + 0.25 * p2.x;
        let qy = 0.75 * p1.y + 0.25 * p2.y;

        let rx = 0.25 * p1.x + 0.75 * p2.x;
        let ry = 0.25 * p1.y + 0.75 * p2.y;

        new_points.push(Point { x: qx, y: qy });
        new_points.push(Point { x: rx, y: ry });
    }

    new_points
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chaikin_zero_points() {
        let points = vec![];
        assert_eq!(chaikin_step(&points), vec![]);
    }

    #[test]
    fn test_chaikin_one_point() {
        let points = vec![Point { x: 10.0, y: 10.0 }];
        assert_eq!(chaikin_step(&points), vec![Point { x: 10.0, y: 10.0 }]);
    }

    #[test]
    fn test_chaikin_two_points() {
        let points = vec![Point { x: 0.0, y: 0.0 }, Point { x: 100.0, y: 100.0 }];
        assert_eq!(
            chaikin_step(&points),
            vec![Point { x: 0.0, y: 0.0 }, Point { x: 100.0, y: 100.0 }]
        );
    }

    #[test]
    fn test_chaikin_coordinates_25_75() {
        let points = vec![
            Point { x: 0.0, y: 0.0 },
            Point { x: 100.0, y: 0.0 },
            Point { x: 100.0, y: 100.0 },
        ];
        let expected = vec![
            Point { x: 25.0, y: 0.0 },
            Point { x: 75.0, y: 0.0 },
            Point { x: 100.0, y: 25.0 },
            Point { x: 100.0, y: 75.0 },
        ];
        assert_eq!(chaikin_step(&points), expected);
    }

    #[test]
    fn test_chaikin_point_count_increases_correctly() {
        let points = vec![
            Point { x: 0.0, y: 0.0 },
            Point { x: 10.0, y: 0.0 },
            Point { x: 10.0, y: 10.0 },
            Point { x: 0.0, y: 10.0 },
        ];
        let step = chaikin_step(&points);
        assert_eq!(step.len(), 2 * points.len() - 2);

        let points5 = vec![
            Point { x: 0.0, y: 0.0 },
            Point { x: 10.0, y: 0.0 },
            Point { x: 20.0, y: 10.0 },
            Point { x: 30.0, y: 0.0 },
            Point { x: 40.0, y: 20.0 },
        ];
        let step5 = chaikin_step(&points5);
        assert_eq!(step5.len(), 2 * points5.len() - 2);
    }
}
