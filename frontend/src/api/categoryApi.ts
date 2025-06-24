import { Category, NewCategory } from "../types";
export async function FetchCategoriesData(): Promise<Category[] | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/all-categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

    });
    if (res.status === 200) {
      const categoriesData: Category[] = await res.json(); // Make sure that the response is of type Category[]
      return categoriesData;
    }
  } catch (err) {
    console.error(`Error fetching categories data ${err}`);
  }
  return null;
}

export async function GenerateCategoryData(): Promise<Category[] | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/generate-default-categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

    });
    if (res.status === 200) {
      const categoriesData: Category[] = await res.json(); // Make sure that the response is of type Category[]
      return categoriesData;
    }
  } catch (err) {
    console.error(`Error generating categories data ${err}`);
  }
  return null;
}

export async function GetCategory(category_id: string): Promise<Category | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/get-category?category_id=${category_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

    });
    if (res.status === 200) {
      const categoryData: Category = await res.json(); // Make sure that the response is of type Category
      return categoryData;
    }
  } catch (err) {
    console.error(`Error fetching category data ${err}`);
  }
  return null;
}

export async function AddCategory(
  category: NewCategory
): Promise<Category | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/add-category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify(category),
    });
    if (res.status === 201) {
      const newCategory: Category | null = await res.json(); // Make sure that the response is of type Category
      return newCategory;
    }
  } catch (err) {
    console.error(`Error adding category ${err}`);
  }
  return null;
}

export async function UpdateCategoryName(category_id: string, name: string) {
  try {
    const res = await fetch(`${process.env.API_URL}/update-category-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify({ category_id, name }),
    });
    if (res.status === 200) {
      const updatedCategory: Category = await res.json(); // Make sure that the response is of type Category
      return updatedCategory;
    }
  } catch (err) {
    console.error(`Error updating category ${err}`);
  }
  return null;
}

export async function UpdateCategoryDescription(
  category_id: string, description: string
): Promise<Category | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-category-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify({ category_id, description }),
    });
    if (res.status === 200) {
      const updatedCategory: Category = await res.json(); // Make sure that the response is of type Category
      return updatedCategory;
    }
  } catch (err) {
    console.error(`Error updating category ${err}`);
  }
  return null;
}

export async function DeleteCategory(category_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.API_URL}/delete-category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify({ category_id }),
    });
    if (res.status === 200) {
      return true;
    }
  } catch (err) {
    console.error(`Error deleting category ${err}`);
  }
  return false;
}
