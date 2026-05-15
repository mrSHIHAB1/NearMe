/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from "./category.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { ICategory } from "./category.interface";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createCategory = async (payload: any) => {
  const { name, parent, isCustom, image } = payload;

  let level: 0 | 1 | 2 = 0;

  if(!name){
    throw new AppError(httpStatus.NOT_FOUND, "No name is given")
  }

  if (parent) {
    const parentCategory = await Category.findById(parent);

    if (!parentCategory) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent not found");
    }

    level = (parentCategory.level + 1) as 0 | 1 | 2;

    if (level > 2) {
      throw new AppError(httpStatus.BAD_REQUEST, "Max 3 level allowed");
    }
  }

  const category = await Category.create({
    name,
    parent: parent || null,
    level,
    isCustom: isCustom || false,
    isApproved: !isCustom, // custom = pending
    image: image || ""
  });

  return category;
};

const getCategoryTree = async () => {
  const categories = await Category.find({ isApproved: true }).lean();

  const map = new Map();

  categories.forEach((category: any) => {
    map.set(category._id.toString(), { ...category, children: [] });
  });

  const tree: any[] = [];

  categories.forEach((category: any) => {
    if (category.parent) {
      map.get(category.parent.toString())?.children.push(
        map.get(category._id.toString())
      );
    } else {
      tree.push(map.get(category._id.toString()));
    }
  });

  return tree;
};

const approveCategory = async (id: string) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  );

  return category;
};

/**
 * Search categories by name with optional level filter.
 *
 * @param searchTerm  - partial name to search (regex, word-start anchored)
 * @param level       - 0 | 1 | 2  (omit to search all levels)
 *
 * Returns flat array of matching categories (no tree nesting).
 * The client uses level info to decide how to render each result.
 */
const searchCategories = async (
  searchTerm?: string,
  level?: number
): Promise<any[]> => {
  const query: any = { isApproved: true };
 
  if (searchTerm) {
    // word-start anchor keeps results relevant (matches "Plumbing" not "Stumbling")
    query.name = { $regex: `\\b${searchTerm}`, $options: "i" };
  }
 
  if (level !== undefined && [0, 1, 2].includes(level)) {
    query.level = level;
  }
 
  const categories = await Category.find(query)
    .populate("parent", "name level")
    .lean();
 
  return categories;
};
 
/**
 * Returns the full sub-tree rooted at a given category id.
 *
 * Structure returned:
 * {
 *   _id, name, level,
 *   children: [          ← level-1 sub-categories
 *     { _id, name, level, children: [...] }   ← level-2 child categories
 *   ]
 * }
 *
 * Used to build the left panel on page-2:
 *   - top node  = the clicked root category
 *   - children  = sub-categories (Plumbing, Electrical …)
 *   - grandchildren = child categories (General Plumbing, Drain Cleaning …)
 */
const getCategorySubTree = async (categoryId: string): Promise<any> => {
  const root = await Category.findById(categoryId).lean();
 
  if (!root) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
 
  // Fetch all approved descendants in two queries (avoids recursion cost)
  const children = await Category.find({
    parent: categoryId,
    isApproved: true,
  }).lean();
 
  const childIds = children.map((c: any) => c._id);
 
  const grandChildren = await Category.find({
    parent: { $in: childIds },
    isApproved: true,
  }).lean();
 
  // Group grandchildren under their parent
  const grandChildMap = new Map<string, any[]>();
  grandChildren.forEach((gc: any) => {
    const key = gc.parent.toString();
    if (!grandChildMap.has(key)) grandChildMap.set(key, []);
    (grandChildMap.get(key) as any[]).push({ ...gc, children: [] });
  });
 
  const tree = {
    ...root,
    children: children.map((child: any) => ({
      ...child,
      children: grandChildMap.get(child._id.toString()) ?? [],
    })),
  };
 
  return tree;
};

/**
 * Internal utility: collect all descendant category IDs for a given root.
 * Exported so service.service.ts can reuse it.
 */
export const getAllDescendantCategoryIds = async (
  categoryId: string
): Promise<string[]> => {
  const ids: string[] = [categoryId];
 
  const children = await Category.find({
    parent: categoryId,
    isApproved: true,
  }).lean();
 
  const childIds = children.map((c: any) => c._id.toString());
  ids.push(...childIds);
 
  if (childIds.length > 0) {
    const grandChildren = await Category.find({
      parent: { $in: childIds },
      isApproved: true,
    }).lean();
 
    grandChildren.forEach((gc: any) => ids.push(gc._id.toString()));
  }
 
  return ids;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        payload,
        { new: true, runValidators: true }
    );

    if (payload.image && category.image) {
        await deleteImageFromCLoudinary(category.image)
    }

    return updatedCategory;
};

export const CategoryServices = {
  createCategory,
  getCategoryTree,
  approveCategory,
  searchCategories,
  getCategorySubTree,
  updateCategory
};