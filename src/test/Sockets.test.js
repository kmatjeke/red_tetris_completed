const io = require("socket.io-client");
const http = require("http");
const ioBack = require("socket.io");
const { makeSocket } = require("../server/socket");

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  httpServer = http.createServer();
  httpServerAddr = httpServer.listen().address();
  ioServer = ioBack(httpServer);
  makeSocket(ioServer);
  done();
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach((done) => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socket = io.connect(
    `http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
    {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
    }
  );
  socket.on("connect", () => {
    done();
  });
});

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

describe("basic socket.io example", () => {
  test("should communicate", (done) => {
    ioServer.emit("echo", "Hello World");
    socket.once("echo", (message) => {
      // Check that the message matches
      expect(message).toBe("Hello World");
      done();
    });
    ioServer.on("connection", (mySocket) => {
      expect(mySocket).toBeDefined();
    });
  });
  test("should test socket.io ping event", (done) => {
    socket.emit("action", { type: "server/ping" });
    socket.once("action", (action) => {
      expect(action).toEqual({ type: "pong" });
      done();
    });
  });
  test("should test join event", (done) => {
    let result;
    socket.emit("join", "#12[test]");
    socket.once("updateUsers", (thing) => {
      result = true;
      done();
    });
    setTimeout(() => {
      expect(result).toEqual(true);
      done();
    }, 50);
  });
  test("should test endgame event", (done) => {
    let result;
    socket.emit("join", "#12[test]");
    socket.once("updateUsers", (thing) => {
      socket.emit("endgame");
      socket.once("endgame", (thing) => {
        result = true;
        done();
      });
    });
    setTimeout(() => {
      expect(result).toBeFalsy();
      done();
    }, 50);
  });
  test("should test generate shapes event", (done) => {
    let result;
    socket.emit("join", "#12[test]");
    socket.once("updateUsers", (thing) => {
      socket.emit("receive shapes");
      socket.once("receive shapes", (shapes) => {
        if (shapes) result = true;
        done();
      });
    });
    setTimeout(() => {
      expect(result).toBeFalsy();
      done();
    }, 50);
  });
  test("should test socket.io ping event", (done) => {
    socket.emit("action", { type: "test" });
    let result;
    socket.once("action", (action) => {
      result = action;
    });
    setTimeout(() => {
      expect(result).toEqual(undefined);
      done();
    }, 50);
  });
});
