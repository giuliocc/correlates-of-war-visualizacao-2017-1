d3.gantt = function() {
  var timeDomainStart;
  var timeDomainEnd;
  var magin;
  var warClasses = [];
  var warNames = [];
  var tickFormat = "%Y-%m";


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
      .append("g")
      .attr("class", "gantt-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
    
    svg.selectAll(".chart")
      .data(data, keyFunction).enter()
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("class", function(d){ 
        if(warClasses[d.class] == null){ return "bar";}
        return warClasses[d.class];
      }) 
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.bandwidth(); })
      .attr("width", function(d) { 
        return (x(d.endDate) - x(d.startDate)); 
      });

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
        .transition()
        .call(xAxis);

      svg.append("g").attr("class", "y axis").transition().call(yAxis);

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

  gantt.margin = function(value) {
    if (!arguments.length)
      return margin;
    margin = value;
    return gantt;
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