import { chaikinStep } from './chaikin.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const notificationEl = document.getElementById('notification');

let points = [];
let isAnimating = false;
let currentStep = 0;
const MAX_STEPS = 7;
let animationInterval = null;

// Dragging state
let draggedPoint = null;
const POINT_RADIUS = 8;
const HIT_RADIUS = 15;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}
window.addEventListener('resize', resize);
resize();

function showNotification(msg) {
    notificationEl.textContent = msg;
    notificationEl.classList.add('show');
    setTimeout(() => {
        notificationEl.classList.remove('show');
    }, 3000);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    
    // Check if clicking on an existing point to drag (check in reverse to grab top-most)
    for (let i = points.length - 1; i >= 0; i--) {
        const dx = points[i].x - pos.x;
        const dy = points[i].y - pos.y;
        if (Math.sqrt(dx*dx + dy*dy) <= HIT_RADIUS) {
            draggedPoint = points[i];
            canvas.style.cursor = 'grabbing';
            return;
        }
    }
    
    // Otherwise add new point
    points.push({ x: pos.x, y: pos.y });
    draw();
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedPoint) {
        const pos = getMousePos(e);
        draggedPoint.x = pos.x;
        draggedPoint.y = pos.y;
        draw();
    } else {
        // Update cursor based on hover
        const pos = getMousePos(e);
        let hover = false;
        for (let i = 0; i < points.length; i++) {
            const dx = points[i].x - pos.x;
            const dy = points[i].y - pos.y;
            if (Math.sqrt(dx*dx + dy*dy) <= HIT_RADIUS) {
                hover = true;
                break;
            }
        }
        canvas.style.cursor = hover ? 'grab' : 'crosshair';
    }
});

canvas.addEventListener('mouseup', () => {
    draggedPoint = null;
    canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('mouseleave', () => {
    draggedPoint = null;
    canvas.style.cursor = 'crosshair';
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (points.length === 0) {
            showNotification("Please draw some points first!");
            return;
        }
        if (points.length === 1) {
            showNotification("Only 1 point, can't animate. Need more points.");
            return;
        }
        
        if (isAnimating) {
            stopAnimation();
        } else {
            startAnimation();
        }
    }
    if (e.key === 'Escape') {
        points = [];
        stopAnimation();
        draw();
    }
});

function startAnimation() {
    isAnimating = true;
    currentStep = 0;
    updateStatus();
    
    animationInterval = setInterval(() => {
        currentStep++;
        if (currentStep > MAX_STEPS) {
            currentStep = 0; // Restart animation sequence
        }
        updateStatus();
        draw();
    }, 800); // 800ms per step
}

function stopAnimation() {
    isAnimating = false;
    currentStep = 0;
    clearInterval(animationInterval);
    updateStatus();
    draw();
}

function updateStatus() {
    statusEl.textContent = `Current Step: ${currentStep} / ${MAX_STEPS}`;
}

function getCurvePoints() {
    let curve = points;
    for (let i = 0; i < currentStep; i++) {
        curve = chaikinStep(curve);
    }
    return curve;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (points.length === 0) return;

    // Draw lines between original control points (dashed and semi-transparent)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Determine current curve to render based on animation step
    const curvePoints = isAnimating ? getCurvePoints() : points;
    
    // Draw current curve
    if (curvePoints.length > 1) {
        ctx.beginPath();
        // Highlight active curve in a bright color if animating
        ctx.strokeStyle = isAnimating && currentStep > 0 ? '#38bdf8' : '#cbd5e1';
        ctx.lineWidth = 3;
        
        // If 2 points exist, they will be drawn as a straight line since curvePoints length is 2
        for (let i = 0; i < curvePoints.length; i++) {
            if (i === 0) ctx.moveTo(curvePoints[i].x, curvePoints[i].y);
            else ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
        }
        ctx.stroke();
    }

    // Draw original control points as circles
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Optionally draw current generated curve points for visual effect
    if (isAnimating && currentStep > 0 && currentStep <= MAX_STEPS) {
        for (let i = 0; i < curvePoints.length; i++) {
            ctx.beginPath();
            ctx.arc(curvePoints[i].x, curvePoints[i].y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
        }
    }
}
