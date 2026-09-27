const form = document.getElementById('simulation-form');
const errorMessage = document.getElementById('error-message');
const tableBody = document.querySelector('#result-table tbody');
const chartCanvas = document.getElementById('result-chart');
const dragForm = document.getElementById('drag-form');
const dragErrorMessage = document.getElementById('drag-error-message');
const dragResults = document.getElementById('drag-results');
const dragTableBody = document.querySelector('#drag-result-table tbody');
const dragChartCanvas = document.getElementById('drag-result-chart');
const resultWeight = document.getElementById('result-weight');
const resultDrag = document.getElementById('result-drag');
const resultNet = document.getElementById('result-net');
const resultAcceleration = document.getElementById('result-acceleration');
const resultTerminal = document.getElementById('result-terminal');
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabContents = Array.from(document.querySelectorAll('.tab-content'));
const { toTableRows, toChartSeries } = window.simulationViewModel;

let chart;
let dragChart;

function renderTable(states) {
  tableBody.innerHTML = '';
  const rows = toTableRows(states);

  for (const rowData of rows) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rowData.time}</td>
      <td>${rowData.height}</td>
      <td>${rowData.velocity}</td>
    `;
    tableBody.appendChild(row);
  }
}

function renderChart(states) {
  const { labels, heights, velocities } = toChartSeries(states);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Height (m)',
          data: heights,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          tension: 0.15,
          yAxisID: 'y'
        },
        {
          label: 'Velocity (m/s)',
          data: velocities,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          tension: 0.15,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (s)'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Height (m)'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Velocity (m/s)'
          }
        }
      }
    }
  });
}

function readPositiveNumber(id, label) {
  const value = Number(document.getElementById(id).value);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return value;
}

function renderDragTable(rows) {
  dragTableBody.innerHTML = '';

  for (const rowData of rows) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rowData.time.toFixed(4)}</td>
      <td>${rowData.velocity.toFixed(4)}</td>
      <td>${rowData.acceleration.toFixed(4)}</td>
    `;
    dragTableBody.appendChild(row);
  }
}

function renderDragChart(rows) {
  if (dragChart) {
    dragChart.destroy();
  }

  const labels = rows.map((row) => Number(row.time.toFixed(4)));
  const velocities = rows.map((row) => Number(row.velocity.toFixed(4)));
  const accelerations = rows.map((row) => Number(row.acceleration.toFixed(4)));

  dragChart = new Chart(dragChartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Velocity (m/s)',
          data: velocities,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          tension: 0.15,
          yAxisID: 'y'
        },
        {
          label: 'Acceleration (m/s²)',
          data: accelerations,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          tension: 0.15,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (s)'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Velocity (m/s)'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Acceleration (m/s²)'
          }
        }
      }
    }
  });
}

function buildDragTimeSeries({ gravity, dragFactor, initialVelocity, timeStep, duration }) {
  const rows = [];
  let time = 0;
  let velocity = initialVelocity;
  const stepCount = Math.floor(duration / timeStep);

  for (let step = 0; step <= stepCount; step += 1) {
    const acceleration = gravity - dragFactor * velocity * Math.abs(velocity);
    rows.push({ time, velocity, acceleration });

    velocity = velocity + acceleration * timeStep;
    time = time + timeStep;
  }

  return rows;
}

function runDragCalculation() {
  dragErrorMessage.textContent = '';

  try {
    const mass = readPositiveNumber('drag-mass', 'Mass');
    const gravity = readPositiveNumber('drag-gravity', 'Gravity');
    const cd = readPositiveNumber('drag-cd', 'Drag coefficient');
    const rho = readPositiveNumber('drag-rho', 'Air density');
    const area = readPositiveNumber('drag-area', 'Reference area');
    const timeStep = readPositiveNumber('drag-time-step', 'Time step');
    const duration = readPositiveNumber('drag-duration', 'Duration');

    const velocity = Number(document.getElementById('drag-velocity').value);
    if (!Number.isFinite(velocity) || velocity < 0) {
      throw new Error('Velocity magnitude must be a number greater than or equal to 0.');
    }

    const weight = mass * gravity;
    const dragForce = 0.5 * cd * rho * area * velocity * velocity;
    const netForce = weight - dragForce;
    const acceleration = netForce / mass;
    const terminalVelocity = Math.sqrt((2 * mass * gravity) / (cd * rho * area));
    const dragFactor = (0.5 * cd * rho * area) / mass;
    const rows = buildDragTimeSeries({
      gravity,
      dragFactor,
      initialVelocity: velocity,
      timeStep,
      duration
    });

    resultWeight.textContent = weight.toFixed(4);
    resultDrag.textContent = dragForce.toFixed(4);
    resultNet.textContent = netForce.toFixed(4);
    resultAcceleration.textContent = acceleration.toFixed(4);
    resultTerminal.textContent = terminalVelocity.toFixed(4);
    renderDragTable(rows);
    renderDragChart(rows);

    dragResults.hidden = false;
  } catch (error) {
    dragResults.hidden = true;
    dragErrorMessage.textContent = error.message || 'Calculation failed.';
  }
}

async function runSimulation() {
  errorMessage.textContent = '';

  const inputs = {
    gravity: document.getElementById('gravity').value,
    initialHeight: document.getElementById('height').value,
    initialVelocity: document.getElementById('velocity').value,
    velocityDirection: document.getElementById('velocity-direction').value,
    timeStep: document.getElementById('time-step').value
  };

  try {
    const result = await window.simulationApi.runSimulation(inputs);
    renderTable(result.states);
    renderChart(result.states);
  } catch (error) {
    errorMessage.textContent = error.message || 'Simulation failed.';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  runSimulation();
});

if (dragForm) {
  dragForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runDragCalculation();
  });
}

for (const button of tabButtons) {
  button.addEventListener('click', () => {
    const targetId = button.dataset.tabTarget;

    for (const tabButton of tabButtons) {
      tabButton.classList.toggle('is-active', tabButton === button);
    }

    for (const content of tabContents) {
      content.classList.toggle('is-active', content.id === targetId);
    }
  });
}

runSimulation();
