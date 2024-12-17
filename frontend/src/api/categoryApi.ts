import { Category } from "../types";
export async function fetchCategoriesData(): Promise<Category[] | null> {
    try {
      const res = await fetch("/all-categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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