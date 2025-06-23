import { useEffect, useRef } from "react"
import * as d3 from "d3"
import "./app.css"

function App() {
  let toolTip = useRef()
  const TimeFormat = "%M:%S"
  const yearFormat = "%Y"
  let arrSTime
  const svgAttr = {
    class: "svgBarChart",
    margin: {
      top: 10,
      bottom: 0,
      left: 10,
      right: 0,
    }
  }

  const ChartAttr = {
    width: 800,
    height: 400,
    margin: {
      top: 40,
      bottom: 100,
      left: 70,
      right: 50,
    },
    circleColor: "rgba(86, 141, 151, 0.56)",
    circleRadius: 10,
  }

  useEffect(() => {
    d3.select(".svgContainer").selectAll("svg").remove()
    // svg conf
    const svg = d3
      .select(".svgContainer")
      .append("svg")
      .attr("width", ChartAttr.width + ChartAttr.margin.left + ChartAttr.margin.right)
      .attr("height", ChartAttr.height + ChartAttr.margin.bottom + ChartAttr.margin.top)
      .attr("class", svgAttr.class)

    // g conf
    const g = svg.append("g").attr("transform", `translate(${ChartAttr.margin.left},${ChartAttr.margin.top})`)

    d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then((data) => {
      arrSTime = []
      data.forEach(d => {
        arrSTime.push(d.Time)
        let time = new Date(0)
        time.setSeconds(d.Seconds)
        d.Time = time
        time = new Date(0)
        time.setFullYear(d.Year)
        d.Year = time
      })
      render(data)
    })

    function render(data) {
      // time parsing etc...
      // data.map((d) => d3.timeParse(TimeFormat)(d.Time))

      // x-axis
      const xAxis = d3.scaleTime()
        .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
        .range([0, ChartAttr.width])

      g.append("g")
        .attr("transform", `translate(0,${ChartAttr.height})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(xAxis).tickFormat(d3.timeFormat(yearFormat)))
        .attr("class", "tick")
        .selectAll("text")
        .attr("transform", "translate(10,0)rotate(45)")
        .style("text-anchor", "start")

      // y-axis
      const yAxis = d3.scaleTime()
        .domain(d3.extent(data, (d) => d.Time))
        .range([0, ChartAttr.height])
        .nice()

      g.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yAxis).tickFormat(d3.timeFormat(TimeFormat)))
        .attr("class", "tick")

      // dots
      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => d.Time)
        .attr("cx", (d) => xAxis(d.Year))
        .attr("cy", (d) => yAxis(d.Time))
        .attr("r", ChartAttr.circleRadius)
        .attr("fill", ChartAttr.circleColor)
        .on("mouseover", (event, d) => {
          d3.select(toolTip.current)
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY + 20 + "px")
            .attr("data-year", d.Year)
            .text(`Year: ${d.Year.getFullYear()}, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()}, Nationality: ${d.Nationality}`)
            .transition()
            .duration(500)
            .attr("hidden", null)
            .style("opacity", 0.8)

          event.target.attributes.fill.value = "rgb(0, 0, 0)"
        })
        .on("mouseout", (event) => {
          d3.select(toolTip.current)
            .attr("hidden", "")
            .style("opacity", 0)

          event.target.attributes.fill.value = ChartAttr.circleColor
        })

      // legend
      svg.append("text")
        .attr("id", "legend")
        .attr("x", ChartAttr.width / 2)
        .attr("y", ChartAttr.margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Cyclist Times")

      // tooltip
      d3.select(toolTip.current)
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
    }
  }, [])

  return (
    <>
      <div id="tooltip" ref={toolTip} hidden></div>
      <div id="title">Rider Time and Nationality</div>
      <div className="svgContainer"></div>
    </>
  )
}

export default App