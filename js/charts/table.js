window.redditChart.table = function() {
  let data;
  let table;

  const dispatch = d3.dispatch('mouseOver', 'mouseOut');

  function chart(container) {
    table = container.append('div')
      .classed('table', true);
    chart.render();
  }

  chart.render = function() {
    const dataRows = table.selectAll('.row')
      .data(data, d => d.id)
      .order();

    const dataRowsEnter = dataRows.enter()
      .append('div')
      .classed('row', true)
      .attr('id', d => d.id);

    dataRowsEnter.style('opacity', 0)
      .transition()
      .ease('quad')
      .duration(window.transitionTime)
      .style('opacity', 1);

    dataRowsEnter.append('div')
      .classed('voted', true)
      .html((d) => `
        <div class="arrow up" role="button" aria-label="upvote" tabindex="0"></div>
        <div class="score dislikes">${d.downs}</div>
        <div class="score unvoted">${d.ups}</div>
        <div class="score likes">${d.score}</div>
        <div class="arrow down" role="button" aria-label="downvote" tabindex="0"></div>
      `);

    const thumbnail = dataRowsEnter.append('div')
      .classed('thumbnail', true);

    thumbnail.append('img')
      .attr({
        src: (d) => d.thumbnail,
        width: 70,
        height: 70
      });

    const thumbsWithPreview = thumbnail.filter(d => !d.no_image);
    thumbsWithPreview.append('div')
      .classed('overlay', true)
      .append('span')
      .text('View');

    thumbnail.filter(d => d.no_image)
      .classed('no-preview', true);

    const imgPreview = d3.select('.img-preview');
    const img = imgPreview.select('img');
    const imgMaxWidth = parseInt(img.style('max-width'));
    const imgMaxHeight = parseInt(img.style('max-height'));
    const imgWidthScale = d3.scale
      .linear()
      .domain([ 0, imgMaxWidth ])
      .range([ 0, imgMaxWidth ]);
    const imgHeightScale = d3.scale
      .linear()
      .domain([ 0, imgMaxHeight ])
      .range([ 0, imgMaxHeight ]);

    thumbsWithPreview.on('click', ({ niceImage }) => {

      imgPreview.classed('visible', true);

      img.attr({
        src: niceImage.url,
      });

      img.style({
        width: `${imgWidthScale(niceImage.width)}px`,
        height: `${imgHeightScale(niceImage.height)}px`,
      });

      imgPreview.on('click', function() {
          imgPreview.classed('visible', false);

          img.attr({
            src: '',
          });

          img.style({
            width: 0,
            height: 0,
          });
        });
    });

    const entry = dataRowsEnter.append('div')
      .classed('entry', true);

    entry.append('p')
      .classed('title', true)
      .append('a')
      .classed('title', true)
      .attr({
        href: (d) => `https://reddit.com${d.permalink}`,
        target: '_blank',
        tab_index: 1
      })
      .text(d => d.title)
      .append('span')
      .classed('domain', true)
      .html((d) => `
        (<a href="https://www.reddit.com/domain/${d.domain}" target="_blank">${d.domain}</a>)
      `);

    entry.append('p')
      .classed('tagline', true)
      .html((d) => `
        submitted
        <time title="${getAxisTimeFormat(d.created)}" datetime="${new Date(d.created)}" class="live-timestamp">
          ${getTimeFromNow(d.created)}
        </time>
        by
        <a href="https://www.reddit.com/user/${d.author}" target="_blank" class="author">${d.author}</a>
      `);

    // dispatch mouse events
    dataRowsEnter.on('mouseover', (d) => {
      chart.highlight([ d ]);
      dispatch.mouseOver(d);
    });
    dataRowsEnter.on('mouseout', (d) => {
      chart.unhighlight([ d ]);
      dispatch.mouseOut(d);
    });

    // transition removal of excess rows
    dataRows.exit()
      .style('opacity', 0)
      .transition()
      .ease('quad')
      .remove();
  }

  chart.highlight = function(data) {
    const rows = table.selectAll('.row')
      .data(data, d => d.id)
      .classed('highlighted', true);
  }

  chart.unhighlight = function(data) {
    table.selectAll('.row')
      .data(data, d => d.id)
      .classed('highlighted', false);
  }

  chart.scrollTo = function(data) {
    if (data.length === 1) {
      const target = table.selectAll('.row')
        .data(data, d => d.id)[0][0];

      const targetPos = findYOffset(target);

      d3.transition()
        .duration(window.transitionTime * 2)
        .ease('quad')
        .tween('scrollTop', scrollTopTween(targetPos - 33)); // 33 for some extra spacing
    }
  }

  chart.data = function(val) {
    if (!arguments.length) {
      return data;
    }
    data = val;
    return chart;
  };

  function findYOffset(obj) {
    let top = 0;
    while (obj.offsetParent) {
      top += obj.offsetTop;
      obj = obj.offsetParent;
    }
    return top;
  }

  function scrollTopTween(scrollTop) {
    const node = table.node();
    return function() {
      const i = d3.interpolateNumber(node.scrollTop, scrollTop);
      return function(t) {
        node.scrollTop = i(t);
      };
   };
  }

  return d3.rebind(chart, dispatch, 'on');
};
