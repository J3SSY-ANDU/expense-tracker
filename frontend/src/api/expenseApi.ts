import { Expense, NewExpense } from "../types/Expense";

export async function FetchExpensesData(): Promise<Expense[] | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/all-monthly-expenses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    const res = await fetch(`${process.env.API_URL}/create-expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

export async function UpdateExpenseName(expense_id: string, name: string): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-expense-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense_id, name }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
  }
  return null;
}

export async function UpdateExpenseAmount(expense_id: string, amount: number): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-expense-amount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense_id, amount }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
  }
  return null;
}

export async function UpdateExpenseCategory(expense_id: string, category_id: string): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-expense-category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense_id, category_id }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
  }
  return null;
}

export async function UpdateExpenseDate(expense_id: string, date: string): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-expense-date`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense_id, date }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
  }
  return null;
}

export async function UpdateExpenseNotes(expense_id: string, notes: string): Promise<Expense | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/update-expense-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expense_id, notes }),
    });
    if (res.status === 200) {
      const updatedExpense: Expense = await res.json(); // Make sure that the response is of type Expense
      return updatedExpense;
    }
  } catch (err) {
    console.error(`Error updating expense ${err}`);
  }
  return null;
}

export async function DeleteExpense(expense_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.API_URL}/delete-expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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