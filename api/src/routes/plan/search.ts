import { readFileSync } from "node:fs";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { responseType } from "../../constants/ai";
import type { Variables } from "../../constants/context";
import { searchSchema, searchUpdateSchema } from "../../constants/requests";
import { generateTrip } from "../../lib/ai/generator";
import prisma from "../../lib/prisma";
import { getImage } from "../../lib/unsplash";
import { authenticated } from "../../middlewares/auth";

export const searchRoute = new Hono<{ Variables: Variables }>()
  .post("/", authenticated, zValidator("json", searchSchema), async (ctx) => {
    const user = ctx.get("user");
    const body = ctx.req.valid("json");

    if (user.searches >= 10)
      return ctx.json(
        {
          t: "month_limit",
        },
        {
          status: 429,
        },
      );

    console.log("[Plan] Begin plan create");
    let trip: responseType;

    if (process.env.RETURN_EXAMPLE_DATA) {
      trip = JSON.parse(readFileSync("local/search.json", "utf-8"));
    } else {
      trip = await generateTrip(
        body.location as string,
        new Date(body.startDate as string),
        new Date(body.endDate as string),
        [body.members as number],
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        searches: {
          increment: 1,
        },
      },
    });

    const image = await getImage(body.location as string);
    const record = await prisma.searchRequest.create({
      data: {
        userId: user.id,
        title: trip.title,
        image: image?.url,
        imageAttributes: image?.author,
        location: body.location as string,
        request: body,
        response: trip,
        date: new Date(body.startDate),
      },
    });

    return ctx.json({
      ...trip,
      id: record.id,
    });
  })
  .get("/history", authenticated, async (ctx) => {
    const user = ctx.get("user");

    const searches = await prisma.searchRequest.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        location: true,
        createdAt: true,
        image: true,
        imageAttributes: true,
      },
    });

    return ctx.json(searches);
  })
  .get("/popular", async (ctx) => {
    const searches = await prisma.popularLocations.findMany();
    return ctx.json(searches);
  })
  .get("/:id", authenticated, async (ctx) => {
    const id = ctx.req.param("id");

    const search = await prisma.searchRequest.findUnique({
      where: {
        id: id,
        userId: ctx.get("user").id,
      },
    });

    if (!search)
      return ctx.json(
        {
          t: "not_found",
        },
        {
          status: 404,
        },
      );

    return ctx.json(search);
  })
  .patch(
    "/:id",
    authenticated,
    zValidator("json", searchUpdateSchema),
    async (ctx) => {
      const id = ctx.req.param("id");
      const body = ctx.req.valid("json");

      const search = await prisma.searchRequest.findUnique({
        where: {
          id: id,
          userId: ctx.get("user").id,
        },
      });

      if (!search)
        return ctx.json(
          {
            t: "not_found",
          },
          {
            status: 404,
          },
        );

      const newBody = {
        ...(search.response as responseType),
        accomodationId: body.accomodationId,
      };

      await prisma.searchRequest.update({
        where: {
          id: id,
        },
        data: {
          response: newBody,
        },
      });

      return ctx.json(newBody);
    },
  );
