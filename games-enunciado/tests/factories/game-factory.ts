import prisma from "../../src/config/database";
import { faker } from "@faker-js/faker";

export function createGame(consoleId: number) {
  const game = generateGame(consoleId);

  return prisma.game.create({
    data: game
  })
}

export function generateGame(consoleId: number) {
  return {
    consoleId,
    title: faker.internet.domainName(),
  }
}