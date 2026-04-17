"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getConnection } from "./db";

const CreateInvoice = z.object({
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.string(),
});
const UpdateInvoice = z.object({
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.string(),
});

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;
  const dateCreated = new Date();

  const connection = await getConnection();
  try {
    // 🔌 Create connection
   

    // 🧾 Execute query
    await connection.execute(
      `INSERT INTO invoices (customer_id, amount, status, date_created)
       VALUES (:customerId, :amount, :status, :dateCreated)`,
      {
        customerId,
        amount: amountInCents,
        status,
        dateCreated,
      },
     
    );
    await connection.commit();
  } catch (err) {
    console.error("Error inserting invoice:", err);
    await connection.rollback();
    throw err;
  } finally {
    // 🔒 Always close connection
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
  revalidatePath("/Dashboard/Invoices");
  redirect("/Dashboard/Invoices");
}


 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  const connection = await getConnection();
  try {
    // 🔌 Create connection
   

    // 🧾 Execute query
    await connection.execute(
      `UPDATE invoices
       SET customer_id = :customerId,
           amount = :amount,
           status = :status
       WHERE id = :id`,
      {
        customerId,
        amount: amountInCents,
        status,
        id,
      },
    );
    await connection.commit();
  } catch (err) {
    console.error("Error updating invoice:", err);
    await connection.rollback();
    throw err;
  } finally {
    // 🔒 Always close connection
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }

 
 
  revalidatePath("/Dashboard/Invoices");
  redirect("/Dashboard/Invoices");
}

export async function deleteInvoice(id: string) {




  const connection = await getConnection();
  try {
    // 🔌 Create connection
   

    // 🧾 Execute query
    await connection.execute(
      `DELETE FROM invoices WHERE id = :id`,
      {
        id,
      },
    );
    await connection.commit();
  } catch (err) {
    console.error("Error deleting invoice:", err);
    await connection.rollback();
    throw err;
  } finally {
    // 🔒 Always close connection
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }

  revalidatePath("/Dashboard/Invoices");
}
 
