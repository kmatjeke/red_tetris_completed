const express = require("express");
const io = require("socket.io")();
const { makeSocket } = require("./socket");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);
io.attach(2000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
makeSocket(io);
