window.redditChart.brush = function() {
  let g;
  let data;
  let xRange = [ 0, 600 ];
  let offset = 0;

  const dispatch = d3.dispatch('filter');

  function chart(container, filterDispatch) {
    g = container;

    g.classed('g-brush', true);

    const xDomain = d3.extent(data, d => d.created);
    const xScale = d3.time
      .scale()
      .domain(xDomain)
      .range([
        xRange[0] + offset,
        xRange[1] - offset
      ]);

    const brush = d3.svg
      .brush()
      .x(xScale)

    brush(g);

    const rects = g.selectAll('rect.no-event')
      .data(data);

    rects.enter()
      .append('rect')
      .classed('data no-event', true);

    rects.attr({
      x: ({ created }) => xScale(created),
      y: 0,
      'data-score': (d) => d.score,
      'data-created': (d) => d.created,
    })
    .classed('brushed', false);

    brush.on('brushend', () => {
      const [ minCreated, maxCreated ] = brush.extent();
      const filtered = data.filter(({ created }) => (
        created > minCreated && created < maxCreated
      ));

      const rects = g.selectAll('rect.no-event');

      // resets the style from previous brushing
      rects.classed('brushed', false);

      // update new style
      rects.data(filtered, d => d.id)
        .classed('brushed', true);

      dispatch.filter(filtered, minCreated, maxCreated);
    });

    rects.exit()
      .remove();

    // brush time axis
    const axisG = g.append('g')
      .attr('transform', `translate(0, ${window.brushHeight})`);

    const xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient('bottom')
      .tickSize(0)
      .ticks(7)
      .tickFormat(window.timeFormat);

    xAxis(axisG);
  }

  chart.highlight = function(data) {
    g.selectAll('rect.data')
      .data(data, d => d.id)
      .classed('highlighted', true);
  }

  chart.unhighlight = function(data) {
    g.selectAll('rect.data')
      .data(data, d => d.id)
      .classed('highlighted', false);
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

  chart.offset = function(val) {
    if (!arguments.length) {
      return offset;
    }
    offset = val;
    return chart;
  }

  return d3.rebind(chart, dispatch, 'on');
};
