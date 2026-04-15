declare module "oracledb" {
  export interface ExecuteOptions {
    outFormat?: number;
  }

  export interface ExecuteResult<T = unknown> {
    rows?: T[];
  }

  export interface Connection {
    execute<T = unknown>(
      sql: string,
      bindParams?: Record<string, unknown>,
      options?: ExecuteOptions,
    ): Promise<ExecuteResult<T>>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
  }

  export interface ConnectionAttributes {
    user?: string;
    password?: string;
    connectString?: string;
  }

  export interface OracleDb {
    OUT_FORMAT_OBJECT: number;
    getConnection(
      attributes?: ConnectionAttributes,
    ): Promise<Connection>;
  }

  const oracledb: OracleDb;
  export default oracledb;
}
