import Enzyme, { shallow, render, mount } from "enzyme";
import React, { Component } from "react";
import toJson from "enzyme-to-json";
import Adapter from "enzyme-adapter-react-16";
import * as gameHelpers from "../client/helpers/gameHelpers";
import Tetris from "../client/components/Tetris";

import { act } from "react-dom/test-utils";
import * as move from "../client/helpers/Playerfunctions";
import * as socketHelper from "../client/socket";

const io = require("socket.io-client");
const http = require("http");
const ioBack = require("socket.io");
const { makeSocket } = require("../server/socket");

let socket = null;
let httpServer;
let httpServerAddr;
let ioServer;

beforeAll((done) => {
  httpServer = http.createServer();
  httpServerAddr = httpServer.listen().address();
  ioServer = ioBack(httpServer);
  makeSocket(ioServer);
  done();
});

afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});
beforeEach((done) => {
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

Enzyme.configure({ adapter: new Adapter() });
describe("tests tetris", () => {
  let wrapper;
  jest.useFakeTimers();
  afterEach(() => {
    wrapper.unmount();
  });
  it("display must be correct", () => {
    jest.spyOn(socketHelper, "userSocket").mockImplementation(() => {
      return socket;
    });
    wrapper = mount(<Tetris room={"#12[test]"} />);
    act(() => {
      socket.emit("join", "#12[test]");
      wrapper.update();
      socket.once("updateUser", () => {
        wrapper.find("#startButton button").simulate("click");
        wrapper.update();
      });
    });
    const scoreDisplay = wrapper.find("#scoreDisplay p");
    const rowDisplay = wrapper.find("#rowDisplay p");
    const levelDisplay = wrapper.find("#levelDisplay p");
    expect(scoreDisplay.text()).toEqual("Score: 0");
    expect(rowDisplay.text()).toEqual("Rows: 0");
    expect(levelDisplay.text()).toEqual("Level: 0");
  });
  it("display game over must be correct", () => {
    jest.spyOn(socketHelper, "userSocket").mockImplementation(() => {
      return socket;
    });
    wrapper = mount(<Tetris room={"#12[test]"} />);
    act(() => {
      socket.emit("join", "#12[test]");
      wrapper.update();
      socket.once("updateUser", () => {
        wrapper.find("#startButton button").simulate("click");
        wrapper.update();
        jest.advanceTimersByTime(100000);
        wrapper.update();
        const gameOverDisplay = wrapper.find("#gameOverDisplay p");
        expect(gameOverDisplay.text()).toEqual("Game Over");
      });
    });
    // act(() => {
    // });
  });
  it("checks movement of player", () => {
    jest.spyOn(socketHelper, "userSocket").mockImplementation(() => {
      return socket;
    });
    wrapper = mount(<Tetris room={"#12[test]"} />);
    act(() => {
      socket.emit("join", "#12[test]");
      wrapper.update();
      socket.once("updateUser", () => {
        wrapper.find("#startButton button").simulate("click");
        wrapper.update();
      });
    });
    const checkMovePlayer = jest.spyOn(move, "movePlayer");
    const checkDropPlayer = jest.spyOn(move, "dropPlayer");
    const checkRotatePlayer = jest.spyOn(move, "playerRotation");
    wrapper.simulate("keyDown", { keyCode: 37 });
    wrapper.simulate("keyUp", { keycode: 37 });
    expect(checkMovePlayer).toHaveBeenCalledWith(
      -1,
      expect.any(Function),
      expect.any(Object),
      expect.any(Array),
      expect.any(Function)
    );
    wrapper.simulate("keyDown", { keyCode: 39 });
    wrapper.simulate("keyUp", { keycode: 39 });
    expect(checkMovePlayer).toHaveBeenCalledWith(
      1,
      expect.any(Function),
      expect.any(Object),
      expect.any(Array),
      expect.any(Function)
    );
    wrapper.simulate("keyDown", { keyCode: 40 });
    wrapper.simulate("keyUp", { keycode: 40 });
    expect(checkMovePlayer).toHaveBeenCalledTimes(2);
    wrapper.simulate("keyDown", { keyCode: 38 });
    wrapper.simulate("keyUp", { keycode: 38 });
    expect(checkRotatePlayer).toHaveBeenCalledTimes(1);
  });
});

describe("tests tetris helpers", () => {
  it("tests drop level increase and drop player if not collided", () => {
    const mockUpdatePlayerPos = jest.fn();
    const checkCollisionSpy = jest
      .spyOn(gameHelpers, "checkCollision")
      .mockImplementation(() => {
        return false;
      });
    const mockSetLevel = jest.fn();
    const mockSetDropTime = jest.fn();
    move.drop(
      20,
      0,
      [],
      [],
      mockSetLevel,
      mockSetDropTime,
      mockUpdatePlayerPos,
      jest.fn(),
      { emit: jest.fn() },
      jest.fn(),
      jest.fn()
    );
    expect(mockUpdatePlayerPos).toHaveBeenCalled();
    expect(mockSetLevel).toHaveBeenCalled();
    expect(mockSetDropTime).toHaveBeenCalled();
  });
  it("tests drop level increase and drop player if collided", () => {
    const mockUpdatePlayerPos = jest.fn();
    const mockSetGameOver = jest.fn();
    jest.spyOn(gameHelpers, "checkCollision").mockImplementation(() => {
      return true;
    });
    const mockSetLevel = jest.fn();
    const mockSetDropTime = jest.fn();
    const mockSetStart = jest.fn();
    
    move.drop(
      20,
      0,
      { pos: { y: 0 } },
      [],
      mockSetLevel,
      mockSetDropTime,
      mockUpdatePlayerPos,
      mockSetGameOver,
      { emit: jest.fn() },
      jest.fn(),
      mockSetStart,
      jest.fn()
    );
    expect(mockSetGameOver).toHaveBeenCalledWith(true);
    expect(mockSetDropTime).toHaveBeenCalledWith(null);
    expect(mockSetStart).toHaveBeenCalled();
    expect(mockUpdatePlayerPos).toHaveBeenCalledWith(
      {
        x: 0,
        y: 0,
        collided: true,
      },
      expect.any(Function)
    );
  });
  it("tests drop level increase and drop player if collided and player pos > 1", () => {
    const mockUpdatePlayerPos = jest.fn();
    const mockSetGameOver = jest.fn();
    jest.spyOn(gameHelpers, "checkCollision").mockImplementation(() => {
      return true;
    });
    const mockSetLevel = jest.fn();
    const mockSetDropTime = jest.fn();
    const mockSetStart = jest.fn();
    
    move.drop(
      20,
      0,
      { pos: { y: 2 } },
      [],
      mockSetLevel,
      mockSetDropTime,
      mockUpdatePlayerPos,
      mockSetGameOver,
      { emit: jest.fn() },
      jest.fn(),
      mockSetStart,
      jest.fn()
    );
    expect(mockUpdatePlayerPos).toHaveBeenCalledWith(
      {
        x: 0,
        y: 0,
        collided: true,
      },
      expect.any(Function)
    );
  });
  it("tests move player if player has collided", () => {
    const mockUpdatePlayerPos = jest.fn();
    jest.spyOn(gameHelpers, "checkCollision").mockImplementation(() => {
      return true;
    });
    move.movePlayer(1, mockUpdatePlayerPos, [], []);
    expect(mockUpdatePlayerPos).not.toHaveBeenCalled();
  });
  it("tests rotate player", () => {
    const mockUpdatePlayerPos = jest.fn();
    jest.spyOn(gameHelpers, "checkCollision").mockImplementation(() => {
      return true;
    });
    move.movePlayer(1, mockUpdatePlayerPos, [], []);
    expect(mockUpdatePlayerPos).not.toHaveBeenCalled();
  });
});
