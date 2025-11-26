/* **************************************************
 * Imports
 **************************************************/
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

/* **************************************************
 * Types
 ************************************************** */
export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/* **************************************************
 * Users
 ************************************************** */
export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user || undefined;
  } catch {
    return undefined;
  }
}

export async function createUser(userData: {
  email: string;
  name?: string | null;
  image?: string | null;
  password: string;
}) {
  // Verifica se l'email esiste già
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error(`User with email ${userData.email} already exists`);
  }

  // Valida la password
  if (!userData.password || userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Hash della password
  const hashedPassword = await hashPassword(userData.password);

  // Crea l'utente (email sempre verificata)
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name || null,
      emailVerified: true,
      image: userData.image || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Crea l'account con password hashata
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userData.email,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    },
  });

  return user;
}

export async function updateUser(
  id: string,
  userData: {
    email?: string;
    name?: string | null;
    image?: string | null;
    password?: string;
  },
) {
  const existing = await getUserById(id);
  if (!existing) {
    throw new Error(`User ${id} not found`);
  }

  // Se l'email viene cambiata, verifica che non esista già
  if (userData.email && userData.email !== existing.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (emailExists) {
      throw new Error(`User with email ${userData.email} already exists`);
    }
  }

  // Aggiorna l'utente (email sempre verificata)
  const updated = await prisma.user.update({
    where: { id },
    data: {
      email: userData.email,
      name: userData.name !== undefined ? userData.name : existing.name,
      emailVerified: true,
      image: userData.image !== undefined ? userData.image : existing.image,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Se viene fornita una nuova password, aggiorna l'account
  if (userData.password) {
    if (userData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const hashedPassword = await hashPassword(userData.password);

    // Trova l'account credential esistente
    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: id,
        providerId: "credential",
      },
    });

    if (credentialAccount) {
      // Aggiorna la password dell'account esistente
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      // Crea un nuovo account se non esiste
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: updated.email,
          providerId: "credential",
          userId: updated.id,
          password: hashedPassword,
        },
      });
    }
  }

  return updated;
}

export async function deleteUser(id: string) {
  // Verifica se l'utente esiste
  const user = await getUserById(id);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  // Elimina l'utente (le sessioni e gli account verranno eliminati in cascata)
  await prisma.user.delete({
    where: { id },
  });
}
