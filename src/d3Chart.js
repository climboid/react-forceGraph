var EventEmitter = require('events').EventEmitter;
var d3 = require('d3');

var ns = {};

var container;
var link;
var node;
var root;

// Toggle children on click.

ns._click = function(d) {
  if (!d3.event.defaultPrevented) {
      if (d.children) {
          d._children = d.children;
          d.children = null;
      } else {
          d.children = d._children;
          d._children = null;
      }
      ns._drawChart();
  }
}

ns._tick = function () {
  link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"; });
}

var force = d3.layout.force()
    .size([800, 600])
    .on("tick", ns._tick);

var zoom = d3.behavior.zoom()
  .scaleExtent([0.5, 100])
  .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  if(d3.event.scale > 3) {
    console.log('scale', d3.event.scale);
    update();
  }
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}



ns.create = function(el, props, state) {
    var svg = d3.select(el).append('svg')
        .attr('class', 'd3')
        .attr('width', props.width)
        .attr('height', props.height)
        .call(zoom);

    container = svg.append('g')
        .attr('class', 'd3-points');

    var dispatcher = new EventEmitter();
    
    this._drawChart(el, state, dispatcher);

    return dispatcher;
};


var data = {
    "name": "flare",
    "children": [{
        "fName": "Clark",
        "lName": "Kent",
        "size": 60,
        "type": "root",
        "selected": true,
        "children": [{
                "lName": "Alvarez",
                "fName": "Holly",
                "size": 90,
                "type": "root",
                "selected": true,
                "children": [
                    { "lName": "Sanders", "fName": "George", "size": 40, "type": "leaf", "selected": false },
                    { "lName": "Jones", "fName": "Jessica", "size": 60, "type": "leaf", "selected": false }
                ]
            },
            { "lName": "Sanders", "fName": "George", "size": 40, "type": "leaf", "selected": false },
            { "lName": "Jones", "fName": "Jessica", "size": 60, "type": "leaf", "selected": false },
            { "lName": "Simon", "fName": "Hugh", "size": 50, "type": "leaf", "selected": false },
            { "lName": "Frost", "fName": "Emma", "size": 20, "type": "leaf", "selected": false },
            { "lName": "Stacy", "fName": "Gwen", "size": 30, "type": "leaf", "selected": false },
            { "lName": "White", "fName": "Walter", "size": 45, "type": "leaf", "selected": false },
            { "lName": "Worthy", "fName": "Arthur", "size": 25, "type": "leaf", "selected": false },
            { "lName": "Parker", "fName": "Peter", "size": 35, "type": "leaf", "selected": false },
            { "lName": "Alexander", "fName": "Winston", "size": 45, "type": "leaf", "selected": false },
            { "lName": "Lauren", "fName": "Sofia", "size": 22, "type": "leaf", "selected": false },
            { "lName": "White", "fName": "Jacob", "size": 29, "type": "leaf", "selected": false },
            { "lName": "Smith", "fName": "Lauryn", "size": 28, "type": "leaf", "selected": false },
            { "lName": "White", "fName": "Jacob", "size": 29, "type": "leaf", "selected": false },
            { "lName": "Smith", "fName": "Lauryn", "size": 28, "type": "leaf", "selected": false }
        ]
    }]
};

ns._flatten = function(root) {
  var nodes = [],
          i = 0;

  function recurse(node) {
      if (node.children) node.children.forEach(recurse);
      if (!node.id) node.id = ++i;
      nodes.push(node);
  }

  recurse(root);

  return nodes;
};

ns._color = function(d) {
  if (d.children || d._children) {
      return "root";
  } else if (d.selected) {
      return "leaf active";
  } else {
      return "leaf";
  }
}


ns._drawChart = function(el, dispatcher) {
    var nodes = this._flatten(data);
    var links = d3.layout.tree().links(nodes);
    var MinMaxNode = d3.extent(nodes, function(d) { return d.size; });
    var bubbleScale = d3.scale.linear().domain(MinMaxNode).range([20, 80]);
    var linkScale = d3.scale.linear().domain(MinMaxNode).range([80, 320]);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .linkStrength(1)
        .friction(0.5)
        .linkDistance(function(d) { return linkScale(d.target.size); })
        .gravity(0.1)
        .charge(-1500)
        .theta(0.9)
        .alpha(0.1)
        .start();

    // Update the links…
    link = container.selectAll(".link").data(links, function(d) { return d.target.id; });

    // Exit any old links.
    link.exit().remove();

    // Enter any new links.
    link.enter().insert("line", ".node")
        .attr("class", function(d) {
            return d.source.name == "flare" ? "" : "link";
        })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Update the nodes…
    node = container.selectAll(".node").data(nodes, function(d) { return d.id; });

    // Exit any old nodes.
    node.exit().remove();

    // Enter any new nodes.
    var g = node.enter().append("g")
        .attr("class", "node")
        .call(force.drag);


    g.append("circle")
        .attr("class", ns._color)
        .attr("r", function(d) {
            return bubbleScale(d.size) || 0;
        })
        .on("click", ns._click);

    g.append("text")
        .attr("text-anchor", "start")
        .attr("dx", "-1.5em")
        .attr("dy", "-.35em")
        .attr("font-size", function(d) {
            var val = Math.floor(bubbleScale(d.size) / 3);
            return val > 10 ? val : 10;
        })
        .text(function(d) {
            return d.name !== 'flare' ? d.fName : '';
        })
        .on("click", ns._click);

    g.append("text")
        .attr("text-anchor", "start")
        .text(function(d) {
            return d.name !== 'flare' ? d.lName : '';
        })
        .attr("dx", "-1.5em")
        .attr("dy", function(d) {
            var val = Math.floor(bubbleScale(d.size) / 4);
            return val > 10 ? val : 10;
        })
        .attr("font-size", function(d) {
            var val = Math.floor(bubbleScale(d.size) / 3);
            return val > 10 ? val : 10;
        })
        .on("click", ns._click);

};


module.exports = ns;
