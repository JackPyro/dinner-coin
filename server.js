const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const { times, random } = require("lodash");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

let isPositive = true;

let lastNumber = null;

const types = {
  NORMAL: 1,
  SUPER: 50,
  HYPER: 100,
};

let data = [];

let currentType = types.NORMAL;

const generateSingle = () => {
  const randomFluc = random(0, 500) > 300;

  const direction = isPositive && !randomFluc ? 1 : -1;
  return random(1 + currentType / 2, currentType) * direction;
};

generateInitialData = () => {
  const time = new Date().getTime() - 2000 * 10;

  times(40, (i) => {
    data.push({
      x: time + i * 2000,
      y: generateSingle(),
    });
  });

  lastNumber = data[data.length - 1].y;
};

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.post("/change-type", (req, res) => {
  const { pass = null, up  } = req.body;
  if (!pass || pass !== "cum") {
    return;
  }

  let type = parseInt(req.body.type);

  isPositive = up === "true";

  console.log(up, isPositive)
  currentType = type;

  res.send("ok");
});

app.use(express.static("public"));

io.sockets.on("connection", function (socket) {
  console.log("a user connected");

  socket.on('disconnect', () => {})

  socket.emit("chart_data_init", {
    data,
  });

  // Generate random samples.
  setInterval(function () {
    let x = new Date().getTime();
    // current time
    let y = lastNumber + generateSingle();

    lastNumber = y;

    data.shift();
    data.push({x, y})

    socket.emit("chart_data", {
      x: x,
      y: y,
    });
  }, 5000); //update every sec.
});

io.sockets.on("disconnect", function () {
  // handle disconnect
  io.sockets.disconnect();
});

server.listen(process.env.PORT || 3000, () => {
  generateInitialData();
  console.log("server running at http://localhost:3000");
});
