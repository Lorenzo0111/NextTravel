import type { InferResponseType } from "hono/client";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { registerForPushNotificationsAsync } from "../NotificationHandler";
import { type ClientType, authenticatedfetcher } from "../fetcher";
import { getLocale } from "../i18n/LocalesHandler";
import { useStorageState } from "../useStorageState";

export type Session = InferResponseType<ClientType["auth"]["me"]["$get"]>;
export type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useSession() {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useSession must be used within a SessionProvider");

  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, token], setToken] = useStorageState("token");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session>();

  const fetchSession = async (token: string | null) => {
    setLoading(true);

    if (!token) {
      setSession(undefined);
      setLoading(false);
      return;
    }

    const fetcher = authenticatedfetcher(token);
    const data = await fetcher.auth.me
      .$get()
      .then(async (res) => await res.json());

    if (!("id" in data)) {
      setSession(undefined);
      setLoading(false);
      throw new Error("Invalid session data");
    }

    setSession(data);
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Fetch session not
  useEffect(() => {
    fetchSession(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        session: session || null,
        isLoading: isLoading || loading,
        login: async (token: string) => {
          setToken(token);

          const fetcher = authenticatedfetcher(token);

          registerForPushNotificationsAsync(fetcher);

          fetcher.auth.language
            .$patch({
              json: { language: getLocale() },
            })
            .then(async (res) =>
              console.log(
                `[Locale] Locale updated successfully (${JSON.stringify(await res.json())})`,
              ),
            );

          await fetchSession(token);
        },
        logout: () => setToken(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
