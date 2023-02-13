import prisma from "config/database";
import { faker } from "@faker-js/faker"

export function createConsole(){
    return prisma.console.create({
        data: {
            name: faker.company.name()
        }
    })
}

export function generateConsole(){
    return {
        name: faker.company.name()
    }
}