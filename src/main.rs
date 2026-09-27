use macroquad::prelude::*;

mod chaikin;
use chaikin::{chaikin_step, Point};

#[macroquad::main("Chaikin's Algorithm")]
async fn main() {
    let mut points: Vec<Point> = Vec::new();
    let mut dragged_point: Option<usize> = None;

    let mut is_animating = false;
    let mut current_step = 0;
    let max_steps = 7;

    let mut last_step_time = get_time();
    let step_duration = 0.8; // seconds per animation step

    let mut notification: Option<(String, f64)> = None;

    loop {
        // Clear screen with a nice dark slate blue background
        clear_background(Color::new(0.06, 0.09, 0.16, 1.0));

        let m_pos = mouse_position();
        let m_x = m_pos.0;
        let m_y = m_pos.1;

        // --- Interaction Logic ---
        if is_mouse_button_pressed(MouseButton::Left) {
            let mut found = None;
            // Iterate in reverse to select the topmost point if they overlap
            for (i, p) in points.iter().enumerate().rev() {
                let dx = p.x - m_x;
                let dy = p.y - m_y;
                if dx * dx + dy * dy <= 15.0 * 15.0 {
                    found = Some(i);
                    break;
                }
            }

            if let Some(idx) = found {
                dragged_point = Some(idx);
            } else {
                points.push(Point { x: m_x, y: m_y });
            }
        }

        if is_mouse_button_down(MouseButton::Left) {
            if let Some(idx) = dragged_point {
                points[idx].x = m_x;
                points[idx].y = m_y;
            }
        }

        if is_mouse_button_released(MouseButton::Left) {
            dragged_point = None;
        }

        if is_key_pressed(KeyCode::Enter) {
            if points.is_empty() {
                notification = Some(("Please draw some points first!".to_string(), get_time()));
            } else if points.len() == 1 {
                notification = Some(("Only 1 point, can't animate.".to_string(), get_time()));
            } else {
                if is_animating {
                    is_animating = false;
                    current_step = 0;
                } else {
                    is_animating = true;
                    current_step = 0;
                    last_step_time = get_time();
                }
            }
        }

        // Bonus: Clear screen functionality
        if is_key_pressed(KeyCode::C) || is_key_pressed(KeyCode::Backspace) {
            points.clear();
            is_animating = false;
            current_step = 0;
        }

        // --- Animation Logic ---
        if is_animating {
            if get_time() - last_step_time >= step_duration {
                current_step += 1;
                if current_step > max_steps {
                    current_step = 0;
                }
                last_step_time = get_time();
            }
        }

        let mut curve = points.clone();
        if is_animating {
            for _ in 0..current_step {
                curve = chaikin_step(&curve);
            }
        }

        // --- Rendering Logic ---

        // 1. Draw dashed/dim lines between original control points
        if points.len() > 1 {
            for i in 0..points.len() - 1 {
                draw_line(
                    points[i].x,
                    points[i].y,
                    points[i + 1].x,
                    points[i + 1].y,
                    2.0,
                    Color::new(0.58, 0.64, 0.72, 0.3),
                );
            }
        }

        // 2. Draw current curve
        if curve.len() > 1 {
            let color = if is_animating && current_step > 0 {
                Color::new(0.22, 0.74, 0.97, 1.0) // Bright blue
            } else {
                Color::new(0.8, 0.83, 0.88, 1.0) // Slate gray
            };

            for i in 0..curve.len() - 1 {
                draw_line(
                    curve[i].x,
                    curve[i].y,
                    curve[i + 1].x,
                    curve[i + 1].y,
                    3.0,
                    color,
                );
            }
        }

        // 3. Draw original control points
        for p in &points {
            draw_circle(p.x, p.y, 8.0, Color::new(0.98, 0.44, 0.52, 1.0)); // Pinkish red
            draw_circle_lines(p.x, p.y, 8.0, 2.0, WHITE);
        }

        // 4. Draw curve points if animating
        if is_animating && current_step > 0 && current_step <= max_steps {
            for p in &curve {
                draw_circle(p.x, p.y, 3.0, Color::new(0.22, 0.74, 0.97, 1.0));
            }
        }

        // --- UI Rendering ---
        draw_text("Chaikin's Algorithm", 20.0, 40.0, 30.0, WHITE);
        draw_text("Click to place/drag points.", 20.0, 70.0, 20.0, LIGHTGRAY);
        draw_text("Press Enter to start/stop.", 20.0, 90.0, 20.0, LIGHTGRAY);
        draw_text("Press C or Backspace to clear.", 20.0, 110.0, 20.0, LIGHTGRAY);
        draw_text("Press Escape to quit window.", 20.0, 130.0, 20.0, LIGHTGRAY);
        
        let ui_text = format!("Current Step: {} / {}", current_step, max_steps);
        draw_text(&ui_text, 20.0, 160.0, 24.0, Color::new(0.22, 0.74, 0.97, 1.0));

        // Notifications rendering
        if let Some((msg, time)) = &notification {
            if get_time() - time < 3.0 {
                let text_len = measure_text(msg, None, 24, 1.0).width;
                let rx = screen_width() / 2.0 - text_len / 2.0 - 20.0;
                draw_rectangle(
                    rx,
                    20.0,
                    text_len + 40.0,
                    40.0,
                    Color::new(0.94, 0.27, 0.27, 0.9),
                );
                draw_text(msg, rx + 20.0, 48.0, 24.0, WHITE);
            }
        }

        next_frame().await
    }
}
