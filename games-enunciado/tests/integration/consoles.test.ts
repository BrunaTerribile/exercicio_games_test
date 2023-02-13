import app from "../../src/app";
import supertest from "supertest";

const api = supertest(app);

describe("GET /consoles", () => {
    it("should return all consoles", async () => {
        const result = await api.get("/consoles");
        const consoles = result.body as Console[];

        expect(consoles).toHaveLength(1)
    })
})