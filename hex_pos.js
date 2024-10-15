document.addEventListener('DOMContentLoaded', function() {

const slider = document.getElementById('slider');
const shotChart = document.querySelector('.shotChart');

// Ensure the shotChart has relative positioning
shotChart.style.position = 'relative';

// Function to create and position the dot
function createDot(top, left, isVisible = false, isLatest = false) {
    const dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = isLatest ? 'red' : 'rgba(255, 0, 0, 0.3)';
    dot.style.top = `${top+30}px`;
    dot.style.left = `${left+15}px`;
    dot.style.display = isVisible ? 'block' : 'none';
    dot.classList.add('shot-dot');
    return dot;
}

// Function to get all shots from the data
function getAllShots(data) {
    return Object.values(data).flatMap(year => 
    year.flatMap(session => session.shots)
    );
}

// Function to initialize dots
function initializeDots(allShots) {
    allShots.forEach((shot, index) => {
    const dot = createDot(shot.top, shot.left, false);
    dot.setAttribute('data-index', index);
    shotChart.appendChild(dot);
    });
}

// Update the shot display based on slider value
function updateShot(allShots) {
    const index = Math.floor(slider.value / (1000 / allShots.length));
    
    shotChart.querySelectorAll('.shot-dot').forEach((dot, i) => {
    if (i <= index) {
        dot.style.display = 'block';
        dot.style.backgroundColor = i === index ? 'red' : 'rgba(255, 0, 0, 0.3)';
    } else {
        dot.style.display = 'none';
    }
    });
}

fetch('bropez_shots.json')
    .then(response => response.json())
    .then(data => {
    const allShots = getAllShots(data);
    initializeDots(allShots);


slider.addEventListener('input', function() {
    updateShot(allShots);

    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(to right, black ${value}%, white ${value}%)`;
    
});

    // Initial update
updateShot(allShots);

console.log('Shot chart initialized with data from bropez_shots.json');
})
.catch(error => console.error('Error loading the shot data:', error));

});