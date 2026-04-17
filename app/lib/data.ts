import oracledb from "oracledb";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from "./definitions";
import { getConnection } from "./db";
import { formatCurrency } from "./utils";

type BindParams = Record<string, string | number>;

async function executeQuery<T>(
  sql: string,
  bindParams: BindParams = {},
): Promise<T[]> {
  const connection = await getConnection();

  try {
    const result = await connection.execute<T>(sql, bindParams, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return result.rows ?? [];
  } finally {
    await connection.close();
  }
}

export async function fetchRevenue() {
  try {
    return await executeQuery<Revenue>(
      `SELECT
         month AS "month",
         revenue AS "revenue"
       FROM revenue
       ORDER BY month`,
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await executeQuery<LatestInvoiceRaw>(
      `SELECT
         invoices.amount AS "amount",
         customers.name AS "name",
         customers.image_url AS "image_url",
         customers.email AS "email",
         invoices.id AS "id"
       FROM invoices
       JOIN customers ON invoices.customer_id = customers.id
       ORDER BY invoices.date_created DESC
       FETCH FIRST 5 ROWS ONLY`,
    );

    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const [invoiceCountData, customerCountData, invoiceStatusData] =
      await Promise.all([
        executeQuery<{ count: number }>(
          `SELECT COUNT(*) AS "count" FROM invoices`,
        ),
        executeQuery<{ count: number }>(
          `SELECT COUNT(*) AS "count" FROM customers`,
        ),
        executeQuery<{ paid: number; pending: number }>(
          `SELECT
             NVL(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS "paid",
             NVL(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS "pending"
           FROM invoices`,
        ),
      ]);

    const numberOfInvoices = Number(invoiceCountData[0]?.count ?? 0);
    const numberOfCustomers = Number(customerCountData[0]?.count ?? 0);
    const totalPaidInvoices = formatCurrency(invoiceStatusData[0]?.paid ?? 0);
    const totalPendingInvoices = formatCurrency(
      invoiceStatusData[0]?.pending ?? 0,
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const searchTerm = `%${query}%`;

  try {
    return await executeQuery<InvoicesTable>(
      `SELECT
         invoices.id AS "id",
         invoices.customer_id AS "customer_id",
         invoices.amount AS "amount",
         TO_CHAR(invoices.date_created, 'YYYY-MM-DD') AS "date",
         invoices.status AS "status",
         customers.name AS "name",
         customers.email AS "email",
         customers.image_url AS "image_url"
       FROM invoices
       JOIN customers ON invoices.customer_id = customers.id
       WHERE
         LOWER(customers.name) LIKE LOWER(:searchTerm) OR
         LOWER(customers.email) LIKE LOWER(:searchTerm) OR
         TO_CHAR(invoices.amount) LIKE :searchTerm OR
         TO_CHAR(invoices.date_created, 'YYYY-MM-DD') LIKE :searchTerm OR
         LOWER(invoices.status) LIKE LOWER(:searchTerm)
       ORDER BY invoices.date_created DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      {
        searchTerm,
        offset,
        limit: ITEMS_PER_PAGE,
      },
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  const searchTerm = `%${query}%`;

  try {
    const data = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) AS "count"
       FROM invoices
       JOIN customers ON invoices.customer_id = customers.id
       WHERE
         LOWER(customers.name) LIKE LOWER(:searchTerm) OR
         LOWER(customers.email) LIKE LOWER(:searchTerm) OR
         TO_CHAR(invoices.amount) LIKE :searchTerm OR
         TO_CHAR(invoices.date_created, 'YYYY-MM-DD') LIKE :searchTerm OR
         LOWER(invoices.status) LIKE LOWER(:searchTerm)`,
      { searchTerm },
    );

    return Math.ceil(Number(data[0]?.count ?? 0) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await executeQuery<InvoiceForm>(
      `SELECT
         invoices.id AS "id",
         invoices.customer_id AS "customer_id",
         invoices.amount AS "amount",
         invoices.status AS "status"
       FROM invoices
       WHERE invoices.id = :id`,
      { id },
    );

    const invoice = data.map((invoiceRecord) => ({
      ...invoiceRecord,
      amount: invoiceRecord.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    return await executeQuery<CustomerField>(
      `SELECT
         id AS "id",
         name AS "name"
       FROM customers
       ORDER BY name ASC`,
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  const searchTerm = `%${query}%`;

  try {
    const data = await executeQuery<CustomersTableType>(
      `SELECT
         customers.id AS "id",
         customers.name AS "name",
         customers.email AS "email",
         customers.image_url AS "image_url",
         COUNT(invoices.id) AS "total_invoices",
         NVL(SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END), 0) AS "total_pending",
         NVL(SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END), 0) AS "total_paid"
       FROM customers
       LEFT JOIN invoices ON customers.id = invoices.customer_id
       WHERE
         LOWER(customers.name) LIKE LOWER(:searchTerm) OR
         LOWER(customers.email) LIKE LOWER(:searchTerm)
       GROUP BY customers.id, customers.name, customers.email, customers.image_url
       ORDER BY customers.name ASC`,
      { searchTerm },
    );

    return data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch customer table.");
  }
}
