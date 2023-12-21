const skipped = (ctx, value) =>
  ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) =>
  ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
let chart = null;
const socket = io({'forceNew':true });

const genericOptions = {
  responsive: true,
  fill: true,
  interaction: {
    intersect: false,
  },
  scales: {
    y: {
      ticks: {
        display: false
      }
    },
    x: {
      ticks: {
        display: false
      }
    },
  },
  animations: {
    x: { duration: 0 }
  },
  radius: 0,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
};

const config = {
  type: "line",
  data: {
    labels: [1],
    datasets: [
      {
        label: "test",
        data: [1],
        borderColor: "#52b788",
        segment: {
          borderColor: (ctx) =>
            skipped(ctx, "rgb(0,0,0,0.2)") || down(ctx, "#e63946"),
          borderDash: (ctx) => skipped(ctx, [6, 6]),
        },
        spanGaps: true,
      },
    ],
  },
  options: {
    ...genericOptions,
  },
};

const setNumber = (value, isPositive) => {
  const elem = document.getElementById("price");
  elem.innerHTML = `${(value/100000).toFixed(6)}`
  elem.className = isPositive ? "ms-text-green" : "ms-text-red"

  const arrow = document.getElementById("arrow");
  arrow.className = isPositive ? "bi bi-arrow-up-right ms-text-green" : "bi bi-arrow-down-right ms-text-red";
 }

document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("dinnercoinchart");

  chart = new Chart(ctx, config);

  socket.on("chart_data_init", function (sample) {
    console.log(sample)
    const labels = sample.data.map((data) => data.x);
    const data = sample.data.map((data) => data.y);

    const dataset = { ...chart.data.datasets[0] };

    dataset.data = data;
    chart.data.datasets[0].data = data;
    chart.data.labels = labels;
    chart.update("none");

    console.log(data, labels)

    const isPositive = data[data.length - 1] >= data[data.length - 2];

    setNumber(data[data.length - 1], isPositive)
   
  });

  socket.on("chart_data", function (sample) {
    chart.data.datasets[0].data.push(sample.y);
    chart.data.datasets[0].data.shift();
    chart.data.labels.push(sample.x);
    chart.data.labels.shift();
    chart.update();

    const data = chart.data.datasets[0].data

    const isPositive = data[data.length - 1] >= data[data.length - 2];

    setNumber(sample.y, isPositive)
   
  });
});
