const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabContents = Array.from(document.querySelectorAll('.tab-content'));
const simulationTabs = Array.from(document.querySelectorAll('[data-simulation-tab]'));
const { toTableRows, toChartSeries } = window.simulationViewModel;

function getTabElements(tabRoot) {
  return {
    form: tabRoot.querySelector('[data-role="simulation-form"]'),
    errorMessage: tabRoot.querySelector('[data-role="error-message"]'),
    tableBody: tabRoot.querySelector('[data-role="result-table"] tbody'),
    chartCanvas: tabRoot.querySelector('[data-role="result-chart"]'),
    terminalVelocity: tabRoot.querySelector('[data-role="terminal-velocity"]')
  };
}

function getOptionalFieldValue(tabState, fieldName) {
  const field = tabState.fields[fieldName];
  return field ? field.value : undefined;
}

function renderTable(states, tableBody) {
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

function renderChart(states, chartCanvas, currentChart) {
  const { labels, heights, velocities } = toChartSeries(states);

  if (currentChart) {
    currentChart.destroy();
  }

  return new Chart(chartCanvas, {
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

async function runSimulation(tabState) {
  const { fields, elements, simulationType } = tabState;
  elements.errorMessage.textContent = '';
  if (elements.terminalVelocity) {
    elements.terminalVelocity.textContent = '';
  }

  const inputs = {
    gravity: fields.gravity.value,
    initialHeight: fields.height.value,
    initialVelocity: fields.velocity.value,
    velocityDirection: fields.velocityDirection.value,
    timeStep: fields.timeStep.value,
    mass: getOptionalFieldValue(tabState, 'mass'),
    dragCoefficient: getOptionalFieldValue(tabState, 'dragCoefficient'),
    fluidDensity: getOptionalFieldValue(tabState, 'fluidDensity'),
    referenceArea: getOptionalFieldValue(tabState, 'referenceArea')
  };

  try {
    const result = simulationType === 'drag'
      ? await window.simulationApi.runDragSimulation(inputs)
      : await window.simulationApi.runSimulation(inputs);

    renderTable(result.states, elements.tableBody);
    tabState.chart = renderChart(result.states, elements.chartCanvas, tabState.chart);

    if (elements.terminalVelocity && Number.isFinite(result.terminalVelocity)) {
      elements.terminalVelocity.textContent = `Terminal Velocity: ${result.terminalVelocity.toFixed(4)} m/s`;
    }
  } catch (error) {
    elements.errorMessage.textContent = error.message || 'Simulation failed.';
  }
}

function setActiveTab(targetId) {
  for (const button of tabButtons) {
    button.classList.toggle('is-active', button.dataset.tabTarget === targetId);
  }

  for (const content of tabContents) {
    content.classList.toggle('is-active', content.id === targetId);
  }
}

for (const button of tabButtons) {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.tabTarget);
  });
}

for (const tabRoot of simulationTabs) {
  const elements = getTabElements(tabRoot);
  const tabState = {
    chart: undefined,
    elements,
    simulationType: tabRoot.dataset.simulationType || 'basic',
    fields: {
      gravity: tabRoot.querySelector('[data-field="gravity"]'),
      height: tabRoot.querySelector('[data-field="height"]'),
      velocity: tabRoot.querySelector('[data-field="velocity"]'),
      velocityDirection: tabRoot.querySelector('[data-field="velocity-direction"]'),
      timeStep: tabRoot.querySelector('[data-field="time-step"]'),
      mass: tabRoot.querySelector('[data-field="mass"]'),
      dragCoefficient: tabRoot.querySelector('[data-field="drag-coefficient"]'),
      fluidDensity: tabRoot.querySelector('[data-field="fluid-density"]'),
      referenceArea: tabRoot.querySelector('[data-field="reference-area"]')
    }
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSimulation(tabState);
  });

  runSimulation(tabState);
});
