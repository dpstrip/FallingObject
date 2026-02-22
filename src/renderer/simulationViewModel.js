(function exposeSimulationViewModel(globalObject) {
  function formatNumber(value) {
    return Number(value).toFixed(4);
  }

  function toTableRows(states) {
    return states.map((state) => ({
      time: formatNumber(state.time),
      height: formatNumber(state.height),
      velocity: formatNumber(state.velocity)
    }));
  }

  function toChartSeries(states) {
    return {
      labels: states.map((state) => Number(state.time.toFixed(4))),
      heights: states.map((state) => Number(state.height.toFixed(4))),
      velocities: states.map((state) => Number(state.velocity.toFixed(4)))
    };
  }

  const api = {
    formatNumber,
    toTableRows,
    toChartSeries
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalObject) {
    globalObject.simulationViewModel = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
