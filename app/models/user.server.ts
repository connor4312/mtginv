import type { User } from "@prisma/client";
import { prisma } from "~/db.server";


export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Find a user by email, or creates one if it doesn't exist.
 * @see https://github.com/prisma/docs/issues/640
 */
export async function findOrCreate(email: User["email"]) {
  return prisma.user.upsert({
    create: { email },
    update: {},
    where: { email },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
