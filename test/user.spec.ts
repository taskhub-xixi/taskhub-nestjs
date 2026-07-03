import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import request from "supertest";
import { Logger } from "winston";
import { AppModule } from "../src/app.module";
import { TestModule } from "./test.module";
import { TestService } from "./test.service";

describe("AuthController", () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  // SETUP NESTJS
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  // UNIT TEST USER
  describe("POST /api/auth/register", () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    // SCENARIOS
    it("[should be OK] if [even username is empty]", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "sakentest1@gmail.com",
          password: "sakentest1",
        });
      logger.info(res.body);

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe("sakentest1@gmail.com");
    });

    it("[should be error] if [email is empty]", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          username: "saken",
          password: "sakentest1",
        });

      logger.info(res.body);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("[should be success] if []", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "sakentest12@gmail.com",
          password: "sakensaken12",
        });
      expect(res.status).toBe(200);
    });

    it("[should be fail] if [email is unregistered]", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "sakentest99999@gmail.com",
          password: "99999999asd",
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refresh_token: string;
    beforeEach(async () => {
      const token = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "sakentest12@gmail.com",
          password: "sakensaken12",
        });

      refresh_token = token.headers["set-cookie"];
    });
    it("[should be success] if []", async () => {
      logger.info(`REFRESH_TOKEN ${refresh_token}`);
      const res = await request(app.getHttpServer())
        .post("/api/auth/refresh")
        .set("authorization", `Bearer ${refresh_token}`)
        .set("Cookie", [`refresh_token=${refresh_token}`]);
      expect(res.status).toBe(200);
      expect(res.body.data.access_token).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
