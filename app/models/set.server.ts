import type { Set } from "@prisma/client";
import { prisma } from "~/db.server";
import { appCache } from "../cache";

export type { Set } from "@prisma/client";

export const getSetsAndCodes = appCache(1000 * 60 * 60 * 24, () =>
  prisma.set.findMany({
    select: {
      name: true,
      id: true,
      code: true,
    },
  })
);

/**
 * Updates a Set.
 */
export const upsertAll = (mtgSets: readonly Set[]) =>
  prisma.$transaction(
    mtgSets.map((s) =>
      prisma.set.upsert({
        create: s,
        update: {},
        where: { id: s.id },
      })
    )
  );
