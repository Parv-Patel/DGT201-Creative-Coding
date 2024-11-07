// FCFS & SJF & Round Robin 
// AU2140180 - Parv Patel

let processes = [];
let currentTime = 0;
let currentProcess = null;
let waitingQueue = [];
let completedProcesses = [];
let executionHistory = [];
let isRunning = true;
let currentAlgorithm = 'RoundRobin'; // Set default to Round Robin
let algorithmSelect;
let timeQuantum = 2; // Time quantum for Round Robin

function setup() {
    createCanvas(1200, 700);
    frameRate(1);
    
    // Create algorithm selection using dropdown - displaying on top-right corner
    algorithmSelect = createSelect();
    algorithmSelect.position(900, 20); // Moved to right side
    algorithmSelect.option('First Come First Serve (FCFS)', 'FCFS');
    algorithmSelect.option('Shortest Job First (SJF)', 'SJF');
    algorithmSelect.option('Round Robin (RR)', 'RoundRobin');
    algorithmSelect.selected('RoundRobin');
    algorithmSelect.changed(changeAlgorithm);
    algorithmSelect.style('padding', '5px');
    algorithmSelect.style('font-size', '14px');
    
    // Time quantum slider for Round Robin
    timeQuantumSlider = createSlider(1, 5, 2, 1);
    timeQuantumSlider.position(900, 50);
    timeQuantumSlider.style('width', '200px');
    
    resetSimulation();
}

function changeAlgorithm() {
    currentAlgorithm = algorithmSelect.value();
    resetSimulation();
}

function resetSimulation() {
    currentTime = 0;
    currentProcess = null;
    waitingQueue = [];
    completedProcesses = [];
    executionHistory = [];
    isRunning = true;
    
    // Reset processes
    processes = [
        { id: 1, arrivalTime: 0, burstTime: 4, remainingTime: 4, color: color(255, 100, 100), state: "Not Arrived", waitingTime: 0, startTime: null, executedTime: 0 },
        { id: 2, arrivalTime: 1, burstTime: 3, remainingTime: 3, color: color(100, 255, 100), state: "Not Arrived", waitingTime: 0, startTime: null, executedTime: 0 },
        { id: 3, arrivalTime: 2, burstTime: 5, remainingTime: 5, color: color(100, 100, 255), state: "Not Arrived", waitingTime: 0, startTime: null, executedTime: 0 },
        { id: 4, arrivalTime: 4, burstTime: 2, remainingTime: 2, color: color(255, 255, 100), state: "Not Arrived", waitingTime: 0, startTime: null, executedTime: 0 },
        { id: 5, arrivalTime: 2, burstTime: 3, remainingTime: 3, color: color(255, 100, 255), state: "Not Arrived", waitingTime: 0, startTime: null, executedTime: 0 }
    ];
}

function draw() {
    background(240);
    if (isRunning) {
        updateSimulation();
    }
    
    drawTitle();
    drawAlgorithmLabel();
    drawAllProcessesInfo();
    drawTimeline();
    drawCurrentProcessStatus();
    drawWaitingQueue();
    drawExecutionHistory();
    drawWaitingTimeStats();
    drawControls();
    drawTimeQuantumSlider();
}

function drawTimeQuantumSlider() {
    // Update time quantum from slider range
    timeQuantum = timeQuantumSlider.value();
    
    fill(0);
    textSize(14);
    text(`Time Quantum: ${timeQuantum}`, 900, 90);
}

function drawAlgorithmLabel() {
    textSize(16);
    fill(0);
    // Display the algorithm name
    text(`Current Algorithm: ${currentAlgorithm}`, 600, 40);
    
    // Add specific Time Quantum display for Round Robin
    if (currentAlgorithm === 'RoundRobin') {
        textSize(14);
        text(`Time Quantum: ${timeQuantum}`, 700, 60);
    }
}

function updateSimulation() {
    // Check for new arrival processes
    for (let i = processes.length - 1; i >= 0; i--) {
        if (processes[i].arrivalTime === currentTime) {
            let process = processes.splice(i, 1)[0];
            process.state = "Waiting";
            waitingQueue.push(process);
        }
    }
    
    // Update waiting time for processes in queue
    waitingQueue.forEach(p => {
        if (currentTime >= p.arrivalTime) {
            p.waitingTime++;
        }
    });
    
    // If no current process, then get next from queue based on selected algorithm
    if (!currentProcess && waitingQueue.length > 0) {
        if (currentAlgorithm === 'SJF') {
            // Sort by remaining time for SJF
            waitingQueue.sort((a, b) => a.remainingTime - b.remainingTime);
            currentProcess = waitingQueue.shift();
        } else if (currentAlgorithm === 'FCFS') {
            // For FCFS, first in queue will be processed
            currentProcess = waitingQueue.shift();
        } else if (currentAlgorithm === 'RoundRobin') {
            // For Round Robin, take first process in queue
            currentProcess = waitingQueue.shift();
        }
        
        if (currentProcess) {
            currentProcess.state = "Executing";
            if (currentProcess.startTime === null) {
                currentProcess.startTime = currentTime;
                currentProcess.waitingTime = currentTime - currentProcess.arrivalTime;
            }
        }
    }
    
    // Process execution
    if (currentProcess) {
        currentProcess.remainingTime--;
        currentProcess.executedTime++;
        
        executionHistory.push({
            time: currentTime,
            processId: currentProcess.id,
            color: currentProcess.color
        });
        
        // logic of Round Robin CPU Scheduling process
        if (currentAlgorithm === 'RoundRobin') {
            // Check process has used its time quantum
            if (currentProcess.executedTime >= timeQuantum || currentProcess.remainingTime === 0) {
                if (currentProcess.remainingTime > 0) {
                    // If process is still not complete, then add that process back to waiting queue
                    currentProcess.state = "Waiting";
                    waitingQueue.push(currentProcess);
                    currentProcess.executedTime = 0;
                } else {
                    // Process is complete
                    currentProcess.state = "Completed";
                    completedProcesses.push(currentProcess);
                }
                currentProcess = null;
            }
        } else {
            // For FCFS and SJF
            if (currentProcess.remainingTime === 0) {
                currentProcess.state = "Completed";
                completedProcesses.push(currentProcess);
                currentProcess = null;
            }
        }
    }
    
    currentTime++;
}

function drawTitle() {
    textSize(24);
    fill(0);
    text("CPU Scheduling Simulation", 20, 40);
    textSize(12);
}

function drawAllProcessesInfo() {
    fill(0);
    textSize(16);
    text("All Processes:", 20, 80);
    
    textSize(14);
    let headers = ["Process", "Arrival Time", "Burst Time", "Remaining Time", "Waiting Time", "Status"];
    let columnWidths = [80, 100, 100, 120, 100, 150];
    let startX = 20;
    let y = 110;
    
    headers.forEach((header, index) => {
        text(header, startX, y);
        startX += columnWidths[index];
    });
    
    stroke(200);
    line(20, y + 10, 670, y + 10);
    noStroke();
    
    y += 30;
    for (let p of getAllProcesses()) {
        startX = 20;
        
        fill(p.color);
        rect(startX, y - 15, 60, 20);
        fill(0);
        text(`P${p.id}`, startX + 25, y);
        
        startX += columnWidths[0];
        text(p.arrivalTime, startX, y);
        
        startX += columnWidths[1];
        text(p.burstTime, startX, y);
        
        startX += columnWidths[2];
        text(p.remainingTime, startX, y);
        
        startX += columnWidths[3];
        text(p.waitingTime, startX, y);
        
        startX += columnWidths[4];
        let state = getProcessState(p);
        text(state, startX, y);
        
        y += 30;
    }
}

function drawWaitingTimeStats() {
    fill(0);
    textSize(16);
    text("Waiting Time Statistics:", 700, 110);
    textSize(14);
    
    let y = 140;
    let totalWaitingTime = 0;
    let completedCount = completedProcesses.length;
    
    completedProcesses.forEach(p => {
        totalWaitingTime += p.waitingTime;
    });
    
    text(`Total Waiting Time: ${totalWaitingTime}`, 700, y);
    text(`Average Waiting Time: ${completedCount > 0 ? (totalWaitingTime / completedCount).toFixed(2) : "0.00"}`, 700, y + 25);
}

function getProcessState(process) {
    if (currentProcess && process.id === currentProcess.id) {
        return "Executing";
    } else if (waitingQueue.find(p => p.id === process.id)) {
        return "Waiting";
    } else if (completedProcesses.find(p => p.id === process.id)) {
        return "Completed";
    } else if (process.arrivalTime > currentTime) {
        return "Not Arrived";
    } else {
        return "Ready";
    }
}

function getAllProcesses() {
    return [...processes, ...waitingQueue, ...(currentProcess ? [currentProcess] : []), ...completedProcesses];
}

function drawTimeline() {
    let timelineY = 400;
    stroke(0);
    strokeWeight(2);
    line(50, timelineY, 950, timelineY);
    strokeWeight(1);
    
    for (let t = 0; t <= Math.max(currentTime + 5, 20); t++) {
        let x = map(t, 0, 20, 50, 950);
        line(x, timelineY - 5, x, timelineY + 5);
        noStroke();
        fill(0);
        text(t, x - 5, timelineY + 20);
        stroke(0);
    }
}

function drawCurrentProcessStatus() {
    fill(0);
    textSize(16);
    text("Currently Executing:", 20, 300);
    textSize(14);
    
    if (currentProcess) {
        fill(currentProcess.color);
        rect(20, 310, 150, 30);
        fill(0);
        text(`Process ${currentProcess.id}`, 60, 330);
        text(`Remaining Time: ${currentProcess.remainingTime}`, 180, 330);
        text(`Waiting Time: ${currentProcess.waitingTime}`, 320, 330);
    } else {
        text("CPU IDLE", 20, 330);
    }
}

function drawWaitingQueue() {
    fill(0);
    textSize(16);
    text("Waiting Queue:", 500, 300);
    textSize(14);
    
    let x = 500;
    let y = 310;
    
    if (waitingQueue.length === 0) {
        text("(Empty)", x, y + 20);
    } else {
        for (let p of waitingQueue) {
            fill(p.color);
            rect(x, y, 60, 30);
            fill(0);
            text(`P${p.id}`, x + 25, y + 20);
            x += 70;
        }
    }
}

function drawExecutionHistory() {
    fill(0);
    textSize(16);
    text("Execution History:", 20, 450);
    textSize(14);
    
    let x = 50;
    let y = 470;
    let blockWidth = 60;
    
    for (let exec of executionHistory) {
        fill(exec.color);
        rect(x, y, blockWidth, 40);
        fill(0);
        text(`P${exec.processId}`, x + blockWidth/2 - 10, y + 25);
        x += blockWidth;
    }
}

function drawControls() {
    fill(0);
    textSize(14);
    text("Controls:", 20, 650);
    text("Press SPACE to pause/resume", 20, 600);
    text("Press R to restart simulation", 200, 600);
}

function keyPressed(event) {
    if (key === ' ') {
		event.preventDefault();
        isRunning = !isRunning;
    } else if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}
