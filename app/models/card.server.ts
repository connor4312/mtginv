import type {
  Card as CardRaw,
  Condition,
  Finishes,
  OwnedCard as RawOwned,
} from "@prisma/client";
import Joi from "joi";
import { prisma } from "~/db.server";
import { appCache } from "../cache";

export type Card = CardRaw & {
  finishes: CardFinish[];
  faces: CardFace[];
};

export const enum FinishType {
  Foil,
  Nonfoil,
  Etched,
  Glossy,
}

export type CardFace = {
  name: string;
  oracleId?: string;
  imageUri?: string;
  manaCost?: string;
  typeLine: string;
};

export interface CardFinish {
  type: FinishType;
  price?: number; // price in cents
}

export type OwnedCard = RawOwned & { card: Card };

/**
 * Updates a Set.
 */
export const upsertAll = (cards: readonly Card[]) =>
  prisma.$transaction(
    cards.map((s) =>
      prisma.card.upsert({
        create: s,
        update: {},
        where: { id: s.id },
      })
    )
  );

export interface ICardWithName {
  name: string;
  id: string;
  set: { name: string };
}

/**
 * Gets names of all cards
 */
export const getAllNames = appCache(1000 * 60 * 60 * 24, () =>
  prisma.card.findMany({
    select: { id: true, name: true, set: { select: { name: true } } },
  })
);

/**
 * Gets names of all cards in a set
 */
export const getNamesInSet = (setId: string) =>
  prisma.card.findMany({
    select: { id: true, name: true },
    where: { setId },
  });

/**
 * Gets names of all cards in a set
 */
export const getFaces = async (cardId: string) => {
  const card = await prisma.card.findUnique({
    select: { faces: true },
    where: { id: cardId },
  });

  return card?.faces as CardFace[] | undefined;
};

export const createOwnedCardSchema = Joi.object({
  cardId: Joi.string().required(),
  userId: Joi.string().required(),
  condition: Joi.string().required(),
  finish: Joi.number().required(),
  location: Joi.object({
    id: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
    z: Joi.number().required(),
  }).required(),
});

/**
 * Gets names of all cards in a set
 */
export const createOwnedCard = async (input: {
  cardId: string;
  userId: string;
  condition: Condition;
  finish: Finishes;
  location: {
    id: string;
    x: number;
    y: number;
    z: number;
  };
}) => {
  const card = await prisma.ownedCard.create({
    data: {
      cardId: input.cardId,
      userId: input.userId,
      condition: input.condition,
      finish: input.finish,
      locations: {
        create: {
          isCurrent: true,
          x: input.location.x,
          y: input.location.y,
          z: input.location.z,
          containerId: input.location.id,
        },
      },
    },
    include: { card: true },
  });

  return card;
};
