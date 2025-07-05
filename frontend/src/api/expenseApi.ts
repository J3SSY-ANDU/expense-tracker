import { Expense, NewExpense } from "../types/Expense";

const token = localStorage.getItem("authToken");
export async function FetchExpensesData(): Promise<Expense[] | null> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/all-monthly-expenses`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 200) {
      const expensesData: Expense[] = await res.json(); // Make sure that the response is of type Expense[]
      return expensesData;
    }
  } catch (err) {
    console.error(`Error fetching expenses data ${err}`);
  }
  return null;
}

export async function CreateExpense(
  expense: NewExpense
): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/create-expense`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(expense),
    });
    if (res.status === 201) {
      const newExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return newExpense;
    }
  } catch (err) {
    console.error(`Error creating expense ${err}`);
  }
  return null;
}

export async function UpdateExpense(expense: Expense): Promise<Expense | { error: string}> {
  try {
    const { id, name, amount, category_id, date, notes } = expense;
    const res = await fetch(`${process.env.REACT_APP_API_URL}/update-expense`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id, name, amount, category_id, date, notes }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    } else {
      const data = await res.json();
      return data.error ? { error: data.error } : { error: "Failed to update expense" };
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
    return { error: "Something went wrong. Please try again." }
  }
}

export async function DeleteExpense(expense_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/delete-expense`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ expense_id }),
    });
    if (res.status === 200) {
      return true;
    }
  } catch (err) {
    console.error(`Error deleting expense ${err}`);
  }
  return false;
}