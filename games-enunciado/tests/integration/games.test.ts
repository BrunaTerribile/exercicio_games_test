import { Console, Game } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import app from "../../src/app";
import prisma from "../../src/config/database";
import { createConsole } from "../factories/console.factory";

import { createGame, generateGame } from "../factories/game-factory";

const api = supertest(app);

beforeEach(async () => {
  await prisma.game.deleteMany();
  await prisma.console.deleteMany();
})

describe("GET /games", () => {
  it("should return all games", async () => {
    const { id: consoleId } = await createConsole();

    await createGame(consoleId);
    await createGame(consoleId);

    const result = await api.get("/games");
    const games = result.body as Console[];

    expect(games).toHaveLength(2);
    expect(games).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        consoleId: consoleId
      })
    ]))
  });

  it("should an empty array because no games are registered", async () => {
    const result = await api.get("/games");
    const games = result.body as Game[];

    expect(result.status).toBe(httpStatus.OK);
    expect(games).toHaveLength(0);
  });

  it("should return a game by id", async () => {
    const { id: consoleId } = await createConsole();
    const createdGame = await createGame(consoleId);

    const result = await api.get(`/games/${createdGame.id}`);
    const console = result.body as Console;

    expect(result.status).toBe(httpStatus.OK);
    expect(console).toEqual({
      id: expect.any(Number),
      title: createdGame.title,
      consoleId: consoleId
    })
  })

  it("should return 404 for console not found", async () => {
    const result = await api.get(`/games/0`);
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  })
});

describe("POST /games", () => {
  it("should create a game", async () => {
    const { id: consoleId } = await createConsole();
    const gameBody = generateGame(consoleId);

    await api.post("/games").send(gameBody);

    const persistedGame = await prisma.game.findFirst({
      where: {
        title: gameBody.title
      }
    });

    expect(persistedGame).toEqual({
      id: expect.any(Number),
      title: gameBody.title,
      consoleId: consoleId
    })
  });

  it("should return 422 when trying to create a game with data missing", async () => {
    const result = await api.post("/games").send({ title: "MasterGame, Super Fun" }); // consoleId is missing
    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it("should return 409 when trying to create a game that already exists", async () => {
    const { id: consoleId } = await createConsole();
    const game = await createGame(consoleId);

    const result = await api.post("/games").send({ title: game.title, consoleId });
    expect(result.status).toBe(httpStatus.CONFLICT);
  });

  it("should return 409 when trying to create a game without valid console", async () => {
    const gameBody = generateGame(0);

    const result = await api.post("/games").send(gameBody);
    expect(result.status).toBe(httpStatus.CONFLICT);
  });

})