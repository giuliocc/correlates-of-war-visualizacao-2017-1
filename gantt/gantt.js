d3.gantt = function() {
  var timeDomainStart;
  var timeDomainEnd;
  var margin = {top : 20, right : 40, bottom : 20, left : 10};
  var chart;
  var gX;
  var gY;
  var xAxis;
  var yAxis;
  var warClasses = [];
  var warNames = [];
  var tickFormat = "%Y-%m-%d";
  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  var initTimeDomain = function(data) {
    if(data === undefined || data.length < 1){
      timeDomainStart = d3.time.day.offset(new Date(), -3);
      timeDomainEnd = d3.time.hour.offset(new Date(), +3);
      return;
    }

    data.sort(function(a, b) {
      return a.endDate - b.endDate;
    });
    timeDomainEnd = data[data.length - 1].endDate;
    data.sort(function(a, b) {
      return a.startDate - b.startDate;
    });
    timeDomainStart = data[0].startDate;
  };

  function zoomed() {
    var event = d3.event.transform;
    //event.x += margin.left;
    //event.y += margin.top;
    chart.selectAll(".bar").attr("transform", event);
    //event.x -= margin.left;
    //event.y -= margin.top;

    chart.attr("clip-path", 'url(#clip-gantt)');

    chart.selectAll(".bar")
    .attr("x", function(d){ return x(d.startDate)})
    .attr("y", function(d){ return y(d.warName)});

    gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  };

   function initAxis() {
    x = d3.scaleTime().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]);
    y = d3.scaleBand().domain(warNames).range([ 0, height - margin.top - margin.bottom ]).padding(0.1);

    xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat(tickFormat))
      .tickSize(8).tickPadding(8);

    yAxis = d3.axisLeft().scale(y).tickSize(0);
  };

   function gantt(data) {

    initTimeDomain(data);
    initAxis();

    var svg = d3.select("body")
      .append("svg")
      .attr("class", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    axis_canvas = svg.append("g")
      .attr("class", "gantt-axis")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    svg.append("defs").append("clipPath")
      .attr("id", "clip-gantt")
      .append("rect")
      .attr("width", width)
      .attr("height", height-margin.top-margin.bottom);
      //.attr("x", margin.left);

    chart = svg.append("g")
      .attr("class", "gantt-chart")
      .attr("width", width-margin.left)
      .attr("height", height-margin.top)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")"); 

    var zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[-100, -100], [width + 90, height + 100]])
      .on("zoom", zoomed);
    
    chart.selectAll(".chart")
      .data(data, keyFunction).enter()
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
        .style("opacity", .9);
        div.html(d.warName)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
        .duration(500)
        .style("opacity", 0);
      })
      .on("click", function(d){ clickedWar = d.warName; console.log(clickedWar);})
      .attr("class", "bar")
      .attr("id", function(d){return d.warName}) 
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.bandwidth(); })
      .attr("width", function(d) { 
        return (x(d.endDate) - x(d.startDate)); 
      });

      gX = axis_canvas
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
        .transition()
        .call(xAxis);

      //gY = chart.append("g").attr("class", "y axis").transition().call(yAxis);

      svg.call(zoom);
      return gantt;

  };

  gantt.redraw = function(newData) {

    initTimeDomain(newData);
    initAxis();

    var svg = d3.select("svg");
    var ganttChartGroup = svg.select(".gantt-chart");
    var rect = ganttChartGroup.selectAll("rect").data(newData, keyFunction);

    rect.enter()
      .insert("rect",":first-child")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("class", function(d){ 
        if(warClasses[d.class] == null){ return "bar";}
        return warClasses[d.class];
      })
      .transition()
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.bandwidth(); })
      .attr("width", function(d) { 
         return (x(d.endDate) - x(d.startDate)); 
      });

      rect.merge(rect).transition()
        .attr("transform", rectTransform)
        .attr("height", function(d) { return y.bandwidth(); })
        .attr("width", function(d) { 
           return (x(d.endDate) - x(d.startDate));
        });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return gantt;
  };

  var rectTransform = function(d) {
    return "translate(" + x(d.startDate) + "," + y(d.warName) + ")";
  };

  var keyFunction = function(d) {
    return d.startDate + d.warName + d.endDate;
  };

  gantt.warNames = function(value) {
    if (!arguments.length)
      return warNames;
    warNames = value;
    return gantt;
  };

  gantt.warClasses = function(value) {
    if (!arguments.length)
      return warClasses;
    warClasses = value;
    return gantt;
  };

  gantt.width = function(value) {
    if (!arguments.length)
      return width;
    width = +value;
    return gantt;
  };

  gantt.height = function(value) {
    if (!arguments.length)
      return height;
    height = +value;
    return gantt;
  };

  gantt.tickFormat = function(value) {
    if (!arguments.length)
      return tickFormat;
    tickFormat = value;
    return gantt;
  };

  return gantt;
};