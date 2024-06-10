import * as d3 from 'd3';
import './BarChart.css';
import { useEffect } from 'react';

type Data = [string,number]

const BarChart = () => {
  const width = 800;
  const height = 400;

  useEffect(() => {

    d3.select("#title").text("United States GDP");

    const tooltip = d3.select('#tooltip').attr("opacity", 0).style("display", "none");

    const overlay = d3.select('.overlay').attr("opacity", 0);

    const svg = d3
      .select('#chart')
      .attr('width', width + 100)
      .attr('height', height + 60);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -200)
      .attr('y', 80)
      .text('Gross Domestic Product')
      .style('font-size', '14px');

    svg
      .append('text')
      .attr('x', width / 2 + 120)
      .attr('y', height + 50)
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('class', 'info');

    d3.json(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
    ).then((data) => {
      const chartData = data?.data;

      const barWidth = width / chartData.length;

      // Plot X-Axis
      const dates = chartData.map((element: Data) => {
        return new Date(element[0]);
      });
      
      const xMax = new Date(`${d3.max(dates)}`);
      xMax.setMonth(xMax.getMonth() + 3);
      
      const xScale = d3
      .scaleTime()
      .domain([d3.min(dates), xMax])
      .range([0, width]);
      
      const xAxis = d3.axisBottom(xScale);
      
      svg
      .append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', `translate(60, ${height})`);
      
      // Plot Y-Axis
      const GDP = chartData.map((element: Data) => {
        return element[1];
      });
      
      
      const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(GDP)])
      .range([0, height]);

      const yAxisScale = d3.scaleLinear()
      .domain([0, d3.max(GDP)])
      .range([height, 0]);

      const yAxis = d3.axisLeft(yAxisScale);
      
      svg
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', `translate(60, 0)`);

      // Plot bar chart
      const scaledGDP = GDP.map((element: number) => {
        return yScale(element);
      });

      // separate years
      const years = chartData.map((element: Data) => {
        let quarter;
        const month = element[0].substring(5, 7);
        if (month === '01') {
          quarter = 'Q1';
        } else if (month === '04') {
          quarter = 'Q2';
        } else if (month === '07') {
          quarter = 'Q3';
        } else if (month === '10') {
          quarter = 'Q4';
        }

        return element[0].substring(0, 4) + ' ' + quarter;
      });

      d3.select("svg")
      .selectAll("rect")
      .data(scaledGDP)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", "#33adff")
      .attr("data-date", (_,i) => {
        return chartData[i][0]
      })
      .attr("data-gdp", (_,i) => {
        return chartData[i][1]
      })
      .attr("x", (_, i) => {
        return 60 + xScale(dates[i]);
      })
      .attr("y", (d) => {
        return height - d;
      })
      .attr("width", barWidth)
      .attr("height", d => d)
      .attr("index", (_,i) => i)
      .on("mouseover", (e, d) => {
        const i = e.target.attributes.index.value;

        overlay.transition()
        .duration(0)
        .style("opacity", 0.9)
        .style("height", d+'px')
        .style("width", barWidth+'px')
        .style("left", 78 + xScale(dates[i])+'px')
        .style("top", (height - d + 80) + 'px')


        tooltip.transition()
        .duration(200)
        .style("opacity", 0.9).style("display", "block");

        tooltip.html(
          `${years[i]} <br/> $ ${GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} Billion`
        )
        .attr("data-date", chartData[i][0])
        .style("left", 110 + xScale(dates[i])+'px')
        .style("top", "400px")

      })
      .on("mouseout", () => {
        overlay.transition().duration(0).style("opacity", 0)
        tooltip.transition().duration(200).style("opacity", 0)
      })

    });
  }, []);

  return (
    <>
      <div id="title"></div>
      <div id="tooltip"></div>
      <div className="overlay"></div>
      <svg id="chart"></svg>
    </>
  );
};

export default BarChart;
