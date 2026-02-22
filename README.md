# FallingObject (Node.js + Electron)

Desktop application to solve and visualize the second-order differential equation of a falling ball:

\[
h''(t) = -g
\]

with user inputs for gravity, initial height, initial velocity (up/down), and time step.

The output includes:
- A table of `time`, `height`, `velocity`
- A graph of `height(t)` and `velocity(t)`

## 1) Design Summary

The app follows a layered design using classes and SOLID-oriented responsibilities:

- **UI Layer (Renderer):** Collect inputs, display table/graph.
- **Application Layer (Main + Service):** Receive requests and orchestrate simulation.
- **Domain/Solver Layer:** Encapsulate equation solving and state representation.

Numerical integration uses the **Euler-Cromer method**:

\[
v_{n+1} = v_n + a\Delta t,\quad h_{n+1} = h_n + v_{n+1}\Delta t,\quad a=-g
\]

Simulation stops when height reaches ground (`h <= 0`).

---

## 2) SOLID Mapping

- **S (Single Responsibility):**
	- `SimulationParameters`: stores validated inputs.
	- `SimulationState`: stores one point in time.
	- `EulerCromerSolver`: only solves the ODE.
	- `FallingObjectSimulationService`: validation + orchestration.
- **O (Open/Closed):**
	- New solver classes can be added by extending `ISolver`, without changing UI code.
- **L (Liskov Substitution):**
	- Any solver implementing `solve(parameters)` can replace `EulerCromerSolver`.
- **I (Interface Segregation):**
	- Minimal solver contract in `ISolver`.
- **D (Dependency Inversion):**
	- `FallingObjectSimulationService` depends on `ISolver` abstraction and accepts injected solver.

---

## 3) Project Structure

```
src/
	main.js
	preload.js
	domain/
		SimulationParameters.js
		SimulationState.js
	solver/
		ISolver.js
		EulerCromerSolver.js
	services/
		FallingObjectSimulationService.js
	errors/
		ValidationError.js
	renderer/
		index.html
		app.js
		simulationViewModel.js
		styles.css
test/
	domain/
		SimulationParameters.test.js
		SimulationState.test.js
	errors/
		ValidationError.test.js
	renderer/
		simulationViewModel.test.js
	services/
		FallingObjectSimulationService.test.js
	solver/
		EulerCromerSolver.test.js
		ISolver.test.js
package.json
README.md
```

---

## 4) File Dependency Map

- `src/main.js`
	- depends on Electron APIs
	- depends on `src/services/FallingObjectSimulationService.js`
- `src/preload.js`
	- depends on Electron `contextBridge` and `ipcRenderer`
- `src/services/FallingObjectSimulationService.js`
	- depends on `src/domain/SimulationParameters.js`
	- depends on `src/solver/EulerCromerSolver.js`
	- depends on `src/errors/ValidationError.js`
- `src/solver/EulerCromerSolver.js`
	- depends on `src/solver/ISolver.js`
	- depends on `src/domain/SimulationState.js`
- `src/renderer/app.js`
	- depends on API exposed by `src/preload.js`
	- depends on `src/renderer/simulationViewModel.js`
	- depends on Chart.js loaded in `src/renderer/index.html`
- `src/renderer/simulationViewModel.js`
	- no project-internal dependencies (pure mapping/format helpers)
- `src/renderer/index.html`
	- depends on `src/renderer/styles.css`
	- depends on `src/renderer/simulationViewModel.js`
	- depends on `src/renderer/app.js`

---

## 5) Class Dependency Map

- `FallingObjectSimulationService`
	- depends on `ISolver` contract
	- default concrete dependency: `EulerCromerSolver`
	- uses `SimulationParameters`
	- throws `ValidationError` for invalid inputs
- `EulerCromerSolver` (extends `ISolver`)
	- creates and returns many `SimulationState` objects
- `SimulationParameters`
	- consumed by solver/service
- `SimulationState`
	- consumed by renderer for table/graph

---

## 6) Run Locally

### Prerequisites
- Node.js 20+ and npm

### Steps
1. Clone:
	 ```bash
	 git clone https://github.com/dpstrip/FallingObject.git
	 cd FallingObject
	 ```
2. Install dependencies:
	 ```bash
	 npm install
	 ```
3. Start app:
	 ```bash
	 npm start
	 ```

---

## 7) Run Unit Tests

The project uses Node.js built-in test runner (`node:test`).

### Run all tests
```bash
npm test
```

### Run one specific test file
```bash
node --test test/solver/EulerCromerSolver.test.js
```

### Current test coverage scope
- domain classes (`SimulationParameters`, `SimulationState`)
- error class (`ValidationError`)
- solver contract and implementation (`ISolver`, `EulerCromerSolver`)
- simulation service (`FallingObjectSimulationService`)
- renderer pure helper functions (`simulationViewModel`)

---

## 8) Build Executables (Different Platforms)

This project uses `electron-builder` and outputs packages in `release/`.

### Build for current platform
```bash
npm run build
```

### Linux executable
```bash
npm run build:linux
```
Produces targets like `AppImage` and `deb`.

### Windows executable (from compatible environment)
```bash
npm run build:win
```
Produces an NSIS installer (`.exe`).

### macOS executable (from macOS environment)
```bash
npm run build:mac
```
Produces a `.dmg`.

> Notes:
> - Cross-platform packaging may require running on the target OS (especially macOS signing/notarization).
> - For release signing, configure platform certificates/keys as needed.

---

## 9) Input and Output Behavior

- **Inputs:** gravity, initial height, initial velocity magnitude, velocity direction, time step
- **Outputs:**
	- time series table (`t, h, v`)
	- line chart of `h(t)` and `v(t)`

If inputs are invalid, the app displays a validation message and does not run the solver.
