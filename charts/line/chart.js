d3.redditChart.line = function() {
  let g;
  let data;
  let xRange = [ 0, 600 ];
  let yRange = [ 0, 300 ];
  let width = 5;

  function chart(container) {
    g = container;

    const xDomain = d3.extent(data, d => d.created);
    const xScale = d3.time
      .scale()
      .domain(xDomain)
      .range(xRange);

    const yDomain = [0, d3.max(data, d => d.score)];
    const yScale = d3.scale
      .linear()
      .domain(yDomain)
      .range(yRange);

    const line = d3.svg.line()
      .x(d => xScale(d.created))
      .y(d => yRange[1] - yScale(d.score))
      .interpolate('cardinal');

    const path = g.append('path')
      .attr('d', line(data))
      .style({
        fill: 'none',
        stroke: window.color.green,
        'stroke-width': `${width}px`
      });

    const totalLength = path.node().getTotalLength();

    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(window.transitionTime)
      .attr('stroke-dashoffset', 0);
  }

  chart.data = function(val) {
    if (!arguments.length) {
      return data;
    }
    data = val;
    return chart;
  }

  chart.xRange = function(val) {
    if (!arguments.length) {
      return xRange;
    }
    xRange = val;
    return chart;
  }

  chart.yRange = function(val) {
    if (!arguments.length) {
      return yRange;
    }
    yRange = val;
    return chart;
  }

  chart.width = function(val) {
    if (!arguments.length) {
      return width;
    }
    width = val;
    return chart;
  }

  return chart;
}

function loadExample(data) {

  const container = d3.select('.viz-container')
    .append(`svg`);

  const {
    minWidth,
    maxWidth,
    minHeight,
    maxHeight
  } = getContainerDim(container);

  const chart = d3.redditChart
    .line()
    .data(data)
    .xRange([ minWidth, maxWidth ])
    .yRange([ minHeight, maxHeight ])
    .width(5);

  chart(container);
}
