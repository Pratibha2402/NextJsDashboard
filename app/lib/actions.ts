"use server";

import { z } from "zod";
import { getConnection } from "./db";
import { redirect } from "next/dist/client/components/navigation";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

const CreateInvoice = z.object({
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

  let connection;
 connection = await getConnection();
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
   revalidatePath('/Dashboard/Invoices');
  redirect('/Dashboard/Invoices');
}


 
