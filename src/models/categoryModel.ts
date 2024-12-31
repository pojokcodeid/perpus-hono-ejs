import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllCategories = async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const category = await prisma.category.findUnique({ where: { id } });
  return category;
};

export const createCategory = async (
  categoryName: string
): Promise<Category> => {
  return await prisma.category.create({ data: { categoryName } });
};

export const updateCategory = async (
  id: number,
  categoryName: string
): Promise<Category | null> => {
  return await prisma.category.update({
    where: { id },
    data: { categoryName },
  });
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch (error) {
    throw new Error((error as Error).message);
    return false;
  }
};
