// https://www.d3-graph-gallery.com/graph/interactivity_brush.html

class Mass {
    constructor(pos, radius = 0.08, mass = 0.2){
        this.mass = mass; 
        this.radius = radius; 
        this.pos = new v2d(pos.x, pos.y); //current position
    }
}

//create circles
function element(){
var myCircles;

  myCircles = sp_svg.append("g")
  .selectAll("circle")
  .enter()
  .append("circle")
  .attr("r", 6)
  .attr("cx", 7)
  .attr("cy", 8)
  .style("fill", "darkturquoise")
  .style("opacity", 0.3); 
}




function hookes(stiffness, lengthDisp, lengthRest){
    var F = -stiffness*(lengthDisp-lengthRest); 
}


function position(mass, force){

}


