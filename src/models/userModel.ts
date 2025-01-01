import { PrismaClient, User, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const getAllUsers = async (): Promise<User[]> => {
  const users = await prisma.user.findMany();
  return users.map((user) => ({
    ...user,
    password: "********",
  }));
};

export const getUserById = async (id: number): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return null;
  }
  return {
    ...user,
    password: "",
  };
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: Role = "USER"
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });
};

export const updateUser = async (
  id: number,
  name: string,
  email: string,
  password: string,
  role: Role = "USER"
): Promise<User | null> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({
    where: { id },
    data: { name, email, password: hashedPassword, role },
  });
  if (!user) {
    return null;
  }
  return {
    ...user,
    password: "********",
  };
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (error) {
    throw new Error((error as Error).message);
    return false;
  }
};

export const verifyUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await getUserByEmail(email);
  if (user && (await bcrypt.compare(password, user.password))) {
    return { ...user, password: "********" } as User;
  }
  return null;
};
