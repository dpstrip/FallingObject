const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const tabContents = Array.from(document.querySelectorAll('.tab-content'));
const simulationTabs = Array.from(document.querySelectorAll('[data-simulation-tab]'));
const calculationDialog = document.getElementById('calculation-dialog');
const calculationStatus = document.getElementById('calculation-status');
const calculationOutput = document.getElementById('calculation-output');
const closeCalculationDialogButton = document.getElementById('close-calculation-dialog');
const viewModel = window.simulationViewModel || {
  toTableRows(states) {
    return states;
  },
  toChartSeries(states) {
    return {
      labels: states.map((state) => state.time),
      heights: states.map((state) => state.height),
      velocities: states.map((state) => state.velocity)
    };
  }
};
const { toTableRows, toChartSeries } = viewModel;

if (closeCalculationDialogButton && calculationDialog) {
  closeCalculationDialogButton.addEventListener('click', () => {
    calculationDialog.close();
  });
}

function showCalculationDialogLoading() {
  if (!calculationDialog || !calculationStatus || !calculationOutput) {
    return;
  }

  calculationStatus.textContent = 'Calculating...';
  calculationOutput.textContent = '';
  if (!calculationDialog.open) {
    calculationDialog.showModal();
  }
}

function renderCalculationDialogResult(states) {
  if (!calculationDialog || !calculationStatus || !calculationOutput) {
    return;
  }

  calculationStatus.textContent = `Calculated ${states.length} rows.`;
  const rows = toTableRows(states);
  const lines = ['Time (s) | Height (m) | Velocity (m/s)', '--------------------------------------'];
  for (const row of rows) {
    lines.push(`${row.time} | ${row.height} | ${row.velocity}`);
  }
  calculationOutput.textContent = lines.join('\n');
}

function renderCalculationDialogError(message) {
  if (!calculationDialog || !calculationStatus || !calculationOutput) {
    return;
  }

  calculationStatus.textContent = 'Calculation failed.';
  calculationOutput.textContent = message;
  if (!calculationDialog.open) {
    calculationDialog.showModal();
  }
}

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
  if (typeof Chart === 'undefined') {
    throw new Error('Chart library did not load. Please check internet connection and reload the app.');
  }

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

function buildSignedVelocity(initialVelocity, velocityDirection) {
  if (velocityDirection !== 'up' && velocityDirection !== 'down') {
    throw new Error('Velocity direction must be either up or down.');
  }

  return velocityDirection === 'up' ? initialVelocity : -initialVelocity;
}

function runBasicSimulationLocally(rawInputs) {
  const gravity = Number(rawInputs.gravity);
  const initialHeight = Number(rawInputs.initialHeight);
  const initialVelocityMagnitude = Number(rawInputs.initialVelocity);
  const timeStep = Number(rawInputs.timeStep);

  if (!Number.isFinite(gravity) || gravity <= 0) {
    throw new Error('Gravity must be a positive number.');
  }

  if (!Number.isFinite(initialHeight) || initialHeight < 0) {
    throw new Error('Height must be a number greater than or equal to 0.');
  }

  if (!Number.isFinite(initialVelocityMagnitude) || initialVelocityMagnitude < 0) {
    throw new Error('Initial velocity must be a number greater than or equal to 0.');
  }

  if (!Number.isFinite(timeStep) || timeStep <= 0) {
    throw new Error('Time step must be a positive number.');
  }

  const initialVelocity = buildSignedVelocity(initialVelocityMagnitude, rawInputs.velocityDirection);
  const states = [];
  let time = 0;
  let height = initialHeight;
  let velocity = initialVelocity;
  const acceleration = -gravity;

  states.push({ time, height, velocity });

  while (height > 0) {
    velocity = velocity + acceleration * timeStep;
    height = height + velocity * timeStep;
    time = time + timeStep;

    const clampedHeight = height < 0 ? 0 : height;
    states.push({ time, height: clampedHeight, velocity });

    if (clampedHeight === 0) {
      break;
    }
  }

  return {
    equation: "h''(t) = -g",
    states
  };
}

async function runSimulation(tabState) {
  const { fields, elements, simulationType } = tabState;
  elements.errorMessage.textContent = '';
  if (elements.terminalVelocity) {
    elements.terminalVelocity.textContent = '';
  }
  if (simulationType === 'basic') {
    showCalculationDialogLoading();
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
    let result;

    if (simulationType === 'drag') {
      if (!window.simulationApi || typeof window.simulationApi.runDragSimulation !== 'function') {
        throw new Error('Drag simulation API is unavailable. Please restart the app.');
      }
      result = await window.simulationApi.runDragSimulation(inputs);
    } else if (window.simulationApi && typeof window.simulationApi.runSimulation === 'function') {
      try {
        result = await window.simulationApi.runSimulation(inputs);
      } catch (_error) {
        result = runBasicSimulationLocally(inputs);
        elements.errorMessage.textContent = 'Using local simulation fallback.';
      }
    } else {
      result = runBasicSimulationLocally(inputs);
      elements.errorMessage.textContent = 'Using local simulation fallback.';
    }

    renderTable(result.states, elements.tableBody);
    tabState.chart = renderChart(result.states, elements.chartCanvas, tabState.chart);
    if (simulationType === 'basic') {
      renderCalculationDialogResult(result.states);
    }

    if (elements.terminalVelocity && Number.isFinite(result.terminalVelocity)) {
      elements.terminalVelocity.textContent = `Terminal Velocity: ${result.terminalVelocity.toFixed(4)} m/s`;
    }
  } catch (error) {
    elements.errorMessage.textContent = error.message || 'Simulation failed.';
    if (simulationType === 'basic') {
      renderCalculationDialogError(elements.errorMessage.textContent);
    }
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
  if (!elements.form || !elements.errorMessage || !elements.tableBody || !elements.chartCanvas) {
    continue;
  }

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
      if (tabRoot.classList.contains('is-active')) {
        runSimulation(tabState);
      }

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSimulation(tabState);
  });

  runSimulation(tabState);
});
