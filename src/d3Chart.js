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
        .call(zoom)
        .on("dblclick.zoom", null);

    container = svg.append('g')
        .attr('class', 'd3-points');

    var dispatcher = new EventEmitter();
    
    this._drawChart(el, state, dispatcher);

    return dispatcher;
};


var data = {
    "fmno":78231,
    "first_name": "Clark",
    "last_name": "Kent",
    "size": 60,
    "children": [
      {
        "fmno":78232,
        "last_name": "",
        "first_name": "Telnor",
        "size": 90,
        "children": [
          { "last_name": "Sanders", "first_name": "George", "size": 40, "fmno":78233 },
          { "last_name": "Jones", "first_name": "Jessica", "size": 60, "fmno":78234 },
          { "last_name": "Frost", "first_name": "Emma", "size": 20, "fmno":78238 },
          { "last_name": "Stacy", "first_name": "Gwen", "size": 30, "fmno":78239 },
          { "last_name": "White", "first_name": "Walter", "size": 45, "fmno":78240 },
          { "last_name": "Worthy", "first_name": "Arthur", "size": 25, "fmno":78250 },
          { "last_name": "Parker", "first_name": "Peter", "size": 35, "fmno":78251 },
          { "last_name": "Alexander", "first_name": "Winston", "size": 45, "fmno":78252 },
          { "last_name": "Lauren", "first_name": "Sofia", "size": 22, "fmno":78253 },
          { "last_name": "White", "first_name": "Jacob", "size": 29, "fmno":78254 },
          { "last_name": "Smith", "first_name": "Lauryn", "size": 28, "fmno":78255 },
          { "last_name": "White", "first_name": "Jacob", "size": 29, "fmno":78256 },
          { "last_name": "Smith", "first_name": "Lauryn", "size": 28, "fmno":78257 }
        ]
      },
      { "last_name": "", "first_name": "Scandinavia", "size": 40, "fmno":78235 },
      { "last_name": "", "first_name": "Ericsson", "size": 60, "fmno":78236 },
      { "last_name": "Consulting", "first_name": "NJ", "size": 50, "fmno":78237 }
    ]
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
            return d.name !== 'flare' ? d.first_name : '';
        })
        .on("click", ns._click);

    g.append("text")
        .attr("text-anchor", "start")
        .text(function(d) {
            return d.name !== 'flare' ? d.last_name : '';
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
