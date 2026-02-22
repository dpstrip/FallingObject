const form = document.getElementById('simulation-form');
const errorMessage = document.getElementById('error-message');
const tableBody = document.querySelector('#result-table tbody');
const chartCanvas = document.getElementById('result-chart');
const { toTableRows, toChartSeries } = window.simulationViewModel;

let chart;

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

runSimulation();
