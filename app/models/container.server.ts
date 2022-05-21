import type { ContainerKind } from "@prisma/client";
import Joi from "joi";
import { prisma } from "~/db.server";
import { OwnedCard } from "./card.server";

export type { Container } from "@prisma/client";

export const getAll = (userId: string) =>
  prisma.container.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      kind: true,
      contents: {
        select: {
          ownedCard: {
            select: { card: true },
          },
        },
        take: 10,
      },
    },
  });

export const getContents = async (containerId: string) => {
  const owned = await prisma.cardLocation.findMany({
    where: {
      containerId,
    },
    include: {
      ownedCard: {
        include: {
          card: true,
        },
      },
    },
  });

  return owned.map(o => o.ownedCard) as OwnedCard[];
};

export const addCard = async (opts: {
  cardId: string,
  containerId: string,
  x: number,
  y: number,
  z: number
}) => {

}

export type ContainerOverview = Awaited<ReturnType<typeof getAll>>[0];

export interface IContainerUpdate {
  name: string;
  kind: ContainerKind;
  maxX: number;
  maxY: number;
  maxZ: number;
  public: boolean;
}

export const updateSchema = Joi.object({
  name: Joi.string().required(),
  kind: Joi.string().required(),
  maxX: Joi.number().required(),
  maxY: Joi.number().required(),
  maxZ: Joi.number().required(),
  public: Joi.boolean().required(),
});

export const create = (userId: string, info: IContainerUpdate) =>
  prisma.container.create({
    data: {
      userId,
      name: info.name,
      kind: info.kind,
      maxX: info.maxX,
      maxY: info.maxY,
      maxZ: info.maxZ,
    },
  });
