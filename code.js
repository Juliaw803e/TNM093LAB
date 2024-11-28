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
const padding = 50;
const mass = 0.2; 
// Arrays to hold positions, velocities, and forces
let positions = [];
let velocities = [];
let forces = [];
let isRunning = false;

function initializeGrid() {
    positions = [];
    velocities = [];
    forces = [];
    const xStep = (width - 2 * padding) / (cols - 1);
    const yStep = (height - 2 * padding) / (rows - 1);

    for (let i = 0; i < (rows); i++) {
        const positionRow = [];
        const velocityRow = [];
        const forceRow = [];
        for (let j = 0; j < (cols); j++) {

            var posX = cols + (width)/(cols+1)*(j+1); 
            var posY = rows + (height)/(rows+1)*(i+1); 
            positionRow.push([posX, posY]); // ! TODO: think about how to calculate initial positions for the nodes
            velocityRow.push([0, 0]); // Initial velocity
            forceRow.push([0, 0]); // Initial force
        }
        positions.push(positionRow);
        velocities.push(velocityRow);
        forces.push(forceRow);
    }
    drawNodes();
    drawEdges();
}


//Draw the nodes (circles) on the SVG.
function drawNodes() {
   // example of how to draw nodes on the svg
   const nodes = svg.selectAll("circle").data(positions.flat());
   nodes
       .enter()
       .append("circle")
       .attr("r", nodeRadius*2)
       .merge(nodes)
       .attr("cx", (d) => d[0])
       .attr("cy", (d) => d[1])
       .attr("fill", "blue")
       .attr("stroke", "white")
       .attr("stroke-width", 2); 
s
    var dragHandler = d3.drag()
        .on("drag", function(event, d){
            d3.select(this).attr("cx", event.x).attr("cy", event.y); 
            d[0] = event.x;
            d[1] = event.y;}); 

          

    nodes.call(dragHandler); 
    
    
   nodes.exit().remove();
}


function drawEdges() {
    // TODO: add your implementation here to connect the nodes with lines.

    d3.selectAll("svg line").remove();

    //horizontal lines
    for(let i = 0; i <positions.length; i++){

        for(let j= 0; j <positions[i].length-1;  j++){

        const startNodePosition_x = positions[i][j][0]
        const startNodePosition_y = positions[i][j][1]
        const endNodePosition_x = positions[i][j+1][0]
        const endNodePosition_y = positions[i][j+1][1]

            d3.select("svg")
            .append('line')
            .attr("x1", startNodePosition_x)
            .attr("y1", startNodePosition_y)
            .attr("x2", endNodePosition_x)
            .attr("y2", endNodePosition_y)
            .attr("stroke", "gray")
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
            .attr("stroke", "gray")
            .attr("stroke-width", 2);
        }
      }

}



//Forces:

function hookes(length_q, length_p) {
    springLenght = length_q - length_q; 
    NormaliseradFaktor = (length_q-length_q)/Math.abs(length_q-length_q); 
    return -stiffness * (Math.abs(length_q - length_p)-springLenght)*NormaliseradFaktor; // Kraft

}

function dampingForce(velocity_p, velocity_q){
    //damping force
    return damping*(velocity_p - velocity_q); 

}


function calculateForces() {
    // Reset forces
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            forces[i][j][0] = 0;
            forces[i][j][1] = 0;
        }
    }

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            forces[i][j][0] = dampingForce(velocities[i][j][0],velocities[i-1][j-1][0])+restoreForce+hookes(positions[i][j][0], positions[i-1][j-1][0] );
            forces[i][j][1] = dampingForce(velocities[i][j][1],velocities[i-1][j-1][1])+restoreForce+hookes(positions[i][j][1], positions[i-1][j-1][1] ); 
        }
    }

    // TODO: add your implementation here.
    // Example:
    // - Calculate spring forces (horizontal, vertical, diagonal/sheer).

}

function updatePositions() {
    // TODO: think about how to calculate positions and velocities. (e.g. Euler's method)
    calculateForces();

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            // TODO: potentially implement position and velocity updates here.
            // Example:
            
            velocities[i][j][0] +=  velocities[i-1][j-1][0] + stimeStep*(calculateForces[i-1][j-1][0]/mass); 
            velocities[i][j][1] += velocities[i-1][j-1][1] + stimeStep*(calculateForces[i-1][j-1][1]/mass); 
            positions[i][j][0] += positions[i-1][j-1][0] + stimeStep*velocities[i-1][j-1][0] ; 
            positions[i][j][1] += positions[i-1][j-1][1] + stimeStep*velocities[i-1][j-1][1] ;

        }
    }

    drawEdges();
    drawNodes();

}


function simulationLoop() {
    if (!isRunning) return;

    // TODO: think about how to implement the simulation loop. below are some functions that you might find useful.
    updatePositions();

    requestAnimationFrame(simulationLoop);
}






// Start/Stop simulation
document.getElementById("toggle-simulation").addEventListener("click", () => {
    isRunning = !isRunning;
    document.getElementById("toggle-simulation").innerText = isRunning ? "Stop Simulation" : "Start Simulation";
    if (isRunning) simulationLoop();
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
