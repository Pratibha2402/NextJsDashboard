import bcrypt from "bcrypt";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";
import { getConnection } from "../lib/db";

async function createTableIfMissing(
  connection: Awaited<ReturnType<typeof getConnection>>,
  sql: string,
) {
  try {
    await connection.execute(sql);
  } catch (error) {
    const dbError = error as { errorNum?: number };

    // ORA-00955: name is already used by an existing object
    if (dbError.errorNum !== 955) {
      throw error;
    }
  }
}

async function seedUsers(connection: Awaited<ReturnType<typeof getConnection>>) {
  await createTableIfMissing(
    connection,
    `CREATE TABLE users (
      id VARCHAR2(36) PRIMARY KEY,
      name VARCHAR2(255) NOT NULL,
      email VARCHAR2(255) NOT NULL UNIQUE,
      password VARCHAR2(255) NOT NULL
    )`,
  );

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await connection.execute(
      `MERGE INTO users target
       USING (
         SELECT
           :id AS id,
           :name AS name,
           :email AS email,
           :password AS password
         FROM dual
       ) source
       ON (target.id = source.id)
       WHEN NOT MATCHED THEN
         INSERT (id, name, email, password)
         VALUES (source.id, source.name, source.email, source.password)`,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    );
  }
}

async function seedCustomers(connection: Awaited<ReturnType<typeof getConnection>>) {
  await createTableIfMissing(
    connection,
    `CREATE TABLE customers (
      id VARCHAR2(36) PRIMARY KEY,
      name VARCHAR2(255) NOT NULL,
      email VARCHAR2(255) NOT NULL,
      image_url VARCHAR2(255) NOT NULL
    )`,
  );

  for (const customer of customers) {
    await connection.execute(
      `MERGE INTO customers target
       USING (
         SELECT
           :id AS id,
           :name AS name,
           :email AS email,
           :image_url AS image_url
         FROM dual
       ) source
       ON (target.id = source.id)
       WHEN NOT MATCHED THEN
         INSERT (id, name, email, image_url)
         VALUES (source.id, source.name, source.email, source.image_url)`,
      {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      },
    );
  }
}

async function seedInvoices(connection: Awaited<ReturnType<typeof getConnection>>) {
  await createTableIfMissing(
    connection,
    `CREATE TABLE invoices (
      id VARCHAR2(32) DEFAULT LOWER(RAWTOHEX(SYS_GUID())) PRIMARY KEY,
      customer_id VARCHAR2(36) NOT NULL,
      amount NUMBER NOT NULL,
      status VARCHAR2(255) NOT NULL,
      date_created DATE NOT NULL,
      CONSTRAINT invoices_customer_fk
        FOREIGN KEY (customer_id) REFERENCES customers (id)
    )`,
  );

  for (const invoice of invoices) {
    await connection.execute(
      `MERGE INTO invoices target
       USING (
         SELECT
           :customer_id AS customer_id,
           :amount AS amount,
           :status AS status,
           TO_DATE(:date_created, 'YYYY-MM-DD') AS date_created
         FROM dual
       ) source
       ON (
         target.customer_id = source.customer_id
         AND target.amount = source.amount
         AND target.status = source.status
         AND target.date_created = source.date_created
       )
       WHEN NOT MATCHED THEN
         INSERT (id, customer_id, amount, status, date_created)
         VALUES (LOWER(RAWTOHEX(SYS_GUID())), source.customer_id, source.amount, source.status, source.date_created)`,
      {
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date_created: invoice.date,
      },
    );
  }
}

async function seedRevenue(connection: Awaited<ReturnType<typeof getConnection>>) {
  await createTableIfMissing(
    connection,
    `CREATE TABLE revenue (
      month VARCHAR2(4) PRIMARY KEY,
      revenue NUMBER NOT NULL
    )`,
  );

  for (const revenueRecord of revenue) {
    await connection.execute(
      `MERGE INTO revenue target
       USING (
         SELECT
           :month AS month,
           :revenue AS revenue
         FROM dual
       ) source
       ON (target.month = source.month)
       WHEN NOT MATCHED THEN
         INSERT (month, revenue)
         VALUES (source.month, source.revenue)`,
      {
        month: revenueRecord.month,
        revenue: revenueRecord.revenue,
      },
    );
  }
}

export async function GET() {
  let connection: Awaited<ReturnType<typeof getConnection>> | undefined;

  try {
    connection = await getConnection();

    await seedUsers(connection);
    await seedCustomers(connection);
    await seedInvoices(connection);
    await seedRevenue(connection);

    await connection.commit();

    return Response.json({ message: "Oracle database seeded successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    return Response.json({ error }, { status: 500 });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
