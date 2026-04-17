import ldap, { LdapError } from "ldapjs";

type ADUser = {
  id: string;
  username: string;
  name: string;
};

export async function authenticateWithAD(
  username: string,
  password: string,
): Promise<ADUser> {
  const url = process.env.AD_URL;
  const domain = process.env.AD_DOMAIN;
  const normalizedUsername = username.trim();

  if (!url || !domain) {
    throw new Error("Missing AD configuration");
  }

  if (!normalizedUsername || !password) {
    throw new Error("Username and password are required");
  }

  const principals = [
    `${domain}\\${normalizedUsername}`,
    `${normalizedUsername}@${domain}`,
  ];

  console.info("[AD] Starting authentication", {
    username: normalizedUsername,
    url,
    domain,
    attempts: principals,
  });

  for (const principal of principals) {
    try {
      await bindPrincipal(url, principal, password, normalizedUsername);

      console.info("[AD] Authentication succeeded", {
        username: normalizedUsername,
        principal,
      });

      return {
        id: normalizedUsername,
        username: normalizedUsername,
        name: normalizedUsername,
      };
    } catch (error) {
      const ldapError = error as {
        name?: string;
        code?: string | number;
        message?: string;
      };

      console.error("[AD] Bind attempt failed", {
        username: normalizedUsername,
        principal,
        errorName: ldapError?.name,
        errorCode: ldapError?.code,
        errorMessage: ldapError?.message,
      });
    }
  }

  throw new Error("Invalid credentials");
}

function bindPrincipal(
  url: string,
  principal: string,
  password: string,
  username: string,
) {
  return new Promise<void>((resolve, reject) => {
    const client = ldap.createClient({ url });

    client.on("error", (error : LdapError) => {
      console.error("[AD] LDAP client error", {
        username,
        principal,
        errorName: error.name,
        errorMessage: error.message,
      });
    });

    console.info("[AD] Trying bind", {
      username,
      principal,
    });

    client.bind(principal, password, (error: LdapError | null) => {
      client.unbind();

      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
