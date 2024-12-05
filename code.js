// https://www.d3-graph-gallery.com/graph/interactivity_brush.html

// Select the SVG container
const svg = d3.select("#simulation-area");
const width = svg.attr("width");
const height = svg.attr("height");

let rows = parseInt(document.getElementById("rows").value, 10);
let cols = parseInt(document.getElementById("cols").value, 10);
let restoreForce = parseFloat(document.getElementById("restore-force").value);
let damping = parseFloat(document.getElementById("damping").value);
const nodeRadius = 5;
const timeStep = 0.016;
const padding = 200;
const mass = 1;
let currentMethod = "euler";
// Arrays to hold positions, velocities, and forces
let positions = [];
let velocities = [];
let forces = [];
let isRunning = false;
let prevPositions = [];
let xStep = 0; 
let yStep = 0; 

function initializeGrid() {
    positions = [];
    velocities = [];
    forces = [];
    prevPositions = [];

    xStep = (width - 2 * padding) / (cols - 1);
    yStep = (height - 2 * padding) / (rows - 1);


    for (let i = 0; i < (rows); i++) {
        const positionRow = [];
        const prevPositionRow = [];
        const velocityRow = [];
        const forceRow = [];

        for (let j = 0; j < (cols); j++) {

            const posX = cols + (width) / (cols + 1) * (j + 1);
            const posY = rows + (height) / (rows + 1) * (i + 1);


            positionRow.push([posX, posY]); // ! TODO: think about how to calculate initial positions for the nodes
            prevPositionRow.push([posX, posY]);
            velocityRow.push([0, 0]); // Initial velocity
            forceRow.push([0, 0]); // Initial force
        }
        positions.push(positionRow);
        prevPositions.push(prevPositionRow);
        velocities.push(velocityRow);
        forces.push(forceRow);
    }
    drawNodes();
    drawEdges();
}





function drawEdges() {
    // TODO: add your implementation here to connect the nodes with lines.

    d3.selectAll("svg line").remove();

    //horizontal lines
    for (let i = 0; i < positions.length; i++) {

        for (let j = 0; j < positions[i].length - 1; j++) {

            const startNodePosition_x = positions[i][j][0]
            const startNodePosition_y = positions[i][j][1]
            const endNodePosition_x = positions[i][j + 1][0]
            const endNodePosition_y = positions[i][j + 1][1]

            d3.select("svg")
                .append('line')
                .attr("x1", startNodePosition_x)
                .attr("y1", startNodePosition_y)
                .attr("x2", endNodePosition_x)
                .attr("y2", endNodePosition_y)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);
        }
    }
    //vertical lines 
    for (let i = 0; i < positions.length - 1; i++) {
        for (let j = 0; j < positions[i].length; j++) {

            const startNodePosition_x = positions[i][j][0];
            const startNodePosition_y = positions[i][j][1];
            const endNodePosition_x = positions[i + 1][j][0];
            const endNodePosition_y = positions[i + 1][j][1];

            // Append a vertical line (edge) between the nodes
            d3.select("svg")
                .append('line')
                .attr("x1", startNodePosition_x)
                .attr("y1", startNodePosition_y)
                .attr("x2", endNodePosition_x)
                .attr("y2", endNodePosition_y)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);
        }
    }

    //diagonal lines "\"
    for (let i = 0; i < positions.length - 1; i++) {
        for (let j = 0; j < positions[i].length - 1; j++) {

            const startNodePosition_x = positions[i][j][0];
            const endNodePosition_x = positions[i + 1][j + 1][0];

            const startNodePosition_y = positions[i][j][1];
            const endNodePosition_y = positions[i + 1][j + 1][1];

            // Append a vertical line (edge) between the nodes
            d3.select("svg")
                .append('line')
                .attr("x1", startNodePosition_x)
                .attr("y1", startNodePosition_y)
                .attr("x2", endNodePosition_x)
                .attr("y2", endNodePosition_y)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);
        }
    }

    //diagonal lines "/"
    for (let i = 1; i < positions.length; i++) {
        for (let j = 0; j < positions[i].length - 1; j++) {

            const startNodePosition_x = positions[i][j][0];
            const endNodePosition_x = positions[i - 1][j + 1][0];

            const startNodePosition_y = positions[i][j][1];
            const endNodePosition_y = positions[i - 1][j + 1][1];

            // Append a vertical line (edge) between the nodes
            d3.select("svg")
                .append('line')
                .attr("x1", startNodePosition_x)
                .attr("y1", startNodePosition_y)
                .attr("x2", endNodePosition_x)
                .attr("y2", endNodePosition_y)
                .attr("stroke", "blue")
                .attr("stroke-width", 2);
        }
    }


}


function drawNodes() {
    // example of how to draw nodes on the svg
    const nodes = svg.selectAll("circle").data(positions.flat());
    nodes
        .enter()
        .append("circle")
        .attr("r", nodeRadius * 2)
        .merge(nodes)
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("fill", "blue")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .call(d3.drag()
            .on("start", started)
            .on("drag", dragged)
            .on("end", ended));

    //return svg.node();
    nodes.exit().remove();
}

function started(d) {
    isRunning = false; // Pausa simulationen nakenr en nod dras
}


function dragged(event, d) {
    d[0] = event.x; //dragna noden pos
    d[1] = event.y;

    // Hitta index för den dragna noden i positionsmatrisen
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (positions[i][j] === d) { // Kontrollera vilken nod som dras
                lastModifiedI = i; // Spara raden
                lastModifiedJ = j; // Spara kolumnen
                break;
            }
        }
    }

    isModified = true; // Indikera att en förändring har skett
    drawNodes();
    drawEdges();
}

function ended(d) {
    //isRunning = true; // Återuppta simulationen
    //simulationLoop(); // Starta simulationen
}


//Forces:

/*function hookes(length_q, length_p, direction) {
   
    const stiffness = 20;
    springLenght = length_q - length_p
    NormaliseradFaktor = (length_q - length_p) / Math.abs(length_q - length_p);
    return -stiffness * (Math.abs(length_q - length_p) - springLenght) * NormaliseradFaktor; // Kraft

}

function dampingForce(velocity_p, velocity_q) {
    //damping force
    return damping * (velocity_p - velocity_q);

}*/

function applyForce(row_p, col_p, row_q, col_q, direction) {
    const dx = positions[row_q][col_q][0] - positions[row_p][col_p][0]; 
    const dy = positions[row_q][col_q][1] - positions[row_p][col_p][1];
    const dist = Math.sqrt(dx * dx + dy * dy); 

    const forceMagnitude = restoreForce * (dist - direction); 

    //nomraliser o applicer fjäderkraft
    const fx = forceMagnitude * (dx / dist); 
    const fy = forceMagnitude * (dy / dist);

    forces[row_p][col_p][0] += fx; 
    forces[row_p][col_p][1] += fy;

    //motkraft
    forces[row_q][col_q][0] -= fx;
    forces[row_q][col_q][1] -= fy;

    //Dämping
    const vx = velocities[row_q][col_q][0] - velocities[row_p][col_p][0]; 
    const vy = velocities[row_q][col_q][1] - velocities[row_p][col_p][1]; 

    forces[row_p][col_p][0] += damping * vx;
    forces[row_p][col_p][1] += damping * vy;

    forces[row_q][col_q][0] -= damping * vx;
    forces[row_q][col_q][1] -= damping * vy;


}

function calculateForces() {
    // Reset forces
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            forces[i][j][0] = 0;
            forces[i][j][1] = 0;
        }
    }



    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            //horisomtella
            if (j < cols - 1) {

                //forces[i][j][0] = dampingForce(velocities[i][j][0], velocities[i][j + 1][0]) + restoreForce + hookes(positions[i][j][0], positions[i][j + 1][0], xStep);
               // forces[i][j][1] = dampingForce(velocities[i][j][1], velocities[i][j + 1][1]) + restoreForce + hookes(positions[i][j][1], positions[i][j + 1][1], yStep);

                applyForce(i, j, i, j + 1, xStep);  
                
            }
            //vertikala
            if (i < rows - 1) {

                //forces[i][j][0] = dampingForce(velocities[i][j][0], velocities[i + 1][j][0]) + restoreForce + hookes(positions[i][j][0], positions[i + 1][j][0], yStep);
               // forces[i][j][1] = dampingForce(velocities[i][j][1], velocities[i+1][j][1]) + restoreForce + hookes(positions[i][j][1], positions[i+1][j][1]);
                 applyForce(i, j, i+1, j, yStep); 
            }
            //diagonala
            if (i < rows - 1 && j < cols - 1) {

               // forces[i][j][0] = dampingForce(velocities[i][j][0], velocities[i+1][j + 1][0]) + restoreForce + hookes(positions[i][j][0], positions[i+1][j + 1][0]);
               // forces[i][j][1] = dampingForce(velocities[i][j][1], velocities[i+1][j + 1][1]) + restoreForce + hookes(positions[i][j][1], positions[i+1][j + 1][1]);
                applyForce(i, j, i+1, j + 1, Math.sqrt(xStep*xStep + yStep*yStep));  
            }
            //diagonala
       

        }
    }

    // TODO: add your implementation here.
    // Example:
    // - Calculate spring forces (horizontal, vertical, diagonal/sheer).
}

//Euler
function Euler() {

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // TODO: potentially implement position and velocity updates here.
            // Example:

            velocities[i][j][0] += timeStep * (forces[i][j][0] / mass);
            velocities[i][j][1] += timeStep * (forces[i][j][1] / mass);

            positions[i][j][0] += timeStep * velocities[i][j][0];
            positions[i][j][1] += timeStep * velocities[i][j][1];

        }
    }
}

//Verlet
function verlet() {

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // TODO: potentially implement position and velocity updates here.
            // Example:

            //velocities[i+1][j+1][0] += (1/(2*timeStep)) * (velocities[i+1][j+1][0] - velocities[i-1][j-1][0] ); 
            // velocities[i+1][j+1][1] += (1/(2*timeStep)) * (velocities[i+1][j+1][1] - velocities[i-1][j-1][1] ); 
            //positions[i+1][j+1][0] += 2*(positions[i][j][0])-(positions[i-1][j-1][0]) + (forces[i][j][0]/mass)*timeStep*timeStep; 
            // positions[i+1][j+1][1] += 2*(positions[i][j][1])-(positions[i-1][j-1][1]) + (forces[i][j][1]/mass)*timeStep*timeStep; 


            const xNext = 2 * positions[i][j][0] - prevPositions[i][j][0] + (forces[i][j][0] / mass) * timeStep * timeStep;
            const yNext = 2 * positions[i][j][1] - prevPositions[i][j][1] + (forces[i][j][1] / mass) * timeStep * timeStep;

            // Uppdatera hastigheter
            velocities[i][j][0] = (xNext-positions[i][j][0]) / (2*timeStep);
            velocities[i][j][1] = (yNext-positions[i][j][1]) / (2*timeStep);

            prevPositions[i][j][0] = positions[i][j][0]; 
            prevPositions[i][j][1] = positions[i][j][1]; 

            // Uppdatera positioner
            positions[i][j][0] = xNext;
            positions[i][j][1] = yNext;
        }
    }
}


function updatePositions() {
    // TODO: think about how to calculate positions and velocities. (e.g. Euler's method)
    if (currentMethod === "euler") {
        Euler();
    }
    else {
        verlet();
    }

    drawNodes();
    drawEdges();
}


function simulationLoop() {

    // TODO: think about how to implement the simulation loop. below are some functions that you might find useful.
    if (!isRunning || !isModified) return; // Kör bara om simulationen är aktiv och något har ändrats

    if (lastModifiedI !== null && lastModifiedJ !== null) {
        calculateForces();
        updatePositions([lastModifiedI, lastModifiedJ]); // Skicka den senaste flyttade nodens index
    }

    requestAnimationFrame(simulationLoop);
}

// Start/Stop simulation
document.getElementById("toggle-simulation").addEventListener("click", () => {
    isRunning = !isRunning;
    document.getElementById("toggle-simulation").innerText = isRunning ? "Stop Simulation" : "Start Simulation";
    if (isRunning) simulationLoop();
});

//switch to verlet or back to euler
document.getElementById("toggle-method").addEventListener("click", () => {
    if (currentMethod === "euler") {
        currentMethod = "verlet";
        document.getElementById("toggle-method").innerText = "Switch to Euler";
    }
    else {
        currentMethod = "euler";
        document.getElementById("toggle-method").innerText = "Switch to Verlet";
    }

});

// Update grid rows
document.getElementById("rows").addEventListener("input", (e) => {
    rows = parseInt(e.target.value, 10);
    initializeGrid();
});

// Update grid columns
document.getElementById("cols").addEventListener("input", (e) => {
    cols = parseInt(e.target.value, 10);
    initializeGrid();
});

// Update restore force
document.getElementById("restore-force").addEventListener("input", (e) => {
    restoreForce = parseFloat(e.target.value);
    document.getElementById("restore-force-value").textContent = restoreForce.toFixed(2);
});

// Update damping
document.getElementById("damping").addEventListener("input", (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById("damping-value").textContent = damping.toFixed(2);
});

// Initialize the simulation
initializeGrid();
// additional functions 