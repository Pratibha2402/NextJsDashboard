declare module "oracledb" {
  export interface Connection {
    close(): Promise<void>;
  }

  export interface ConnectionAttributes {
    user?: string;
    password?: string;
    connectString?: string;
  }

  export interface OracleDb {
    getConnection(
      attributes?: ConnectionAttributes,
    ): Promise<Connection>;
  }

  const oracledb: OracleDb;
  export default oracledb;
}
