/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');

var d3Chart = require('./d3Chart');

// require('./Chart.less');

var Chart = React.createClass({
  getDefaultProps: function() {
    return {
      width: '1024px',
      height: '628px'
    };
  },

  dispatcher: null,

  componentDidMount: function() {
    var el = this.getDOMNode();
    var dispatcher = d3Chart.create(el, {
      width: this.props.width,
      height: this.props.height
    }, this.getChartState());
    this.dispatcher = dispatcher;
  },

  componentDidUpdate: function(prevProps, prevState) {
    // var el = this.getDOMNode();
    // d3Chart._drawChart(el, this.dispatcher);
  },

  getChartState: function() {
    var appState = this.props.appState;

    var tooltips = [];
    if (appState.showingAllTooltips) {
      tooltips = appState.data;
    }
    else if (appState.tooltip) {
      tooltips = [appState.tooltip];
    }

    return _.assign({}, appState, {tooltips: tooltips});
  },

  render: function() {
    return (
      <div className="Chart"></div>
    );
  }
});

module.exports = Chart;
