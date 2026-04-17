import oracledb from "oracledb";

function getDbConfig() {
  const user = process.env.DB_USER ?? process.env.ORACLE_USER;
  const password = process.env.DB_PASSWORD ?? process.env.ORACLE_PASSWORD;
  const connectString =
    process.env.DB_CONNECT ?? process.env.ORACLE_CONNECTION_STRING;

  if (!user || !password || !connectString) {
    throw new Error(
      "Missing Oracle DB config. Set DB_USER/DB_PASSWORD/DB_CONNECT or ORACLE_USER/ORACLE_PASSWORD/ORACLE_CONNECTION_STRING.",
    );
  }

  return { user, password, connectString };
}

export async function getConnection() {
  return oracledb.getConnection(getDbConfig());
}
