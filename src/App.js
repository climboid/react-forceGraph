/** @jsx React.DOM */

var React = require('react');

var Chart = require('./Chart');


// require('./App.less');

var App = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },

  render: function() {
    return (
      <div className="App">
        <Chart
          appState={this.state}
          setAppState={this.setAppState} />
      </div>
    );
  },

  setAppState: function(partialState, callback) {
    return this.setState(partialState, callback);
  }
});

module.exports = App;
