declare module "ldapjs" {
  export type ClientOptions = {
    url: string;
  };

  export type LdapError = Error & {
    code?: string | number;
  };

  export type BindCallback = (error: LdapError | null) => void;
  export type ErrorListener = (error: LdapError) => void;

  export interface Client {
    bind(dn: string, password: string, callback: BindCallback): void;
    unbind(): void;
    on(event: "error", listener: ErrorListener): this;
  }

  export function createClient(options: ClientOptions): Client;

  const ldap: {
    createClient: typeof createClient;
  };

  export default ldap;
}
