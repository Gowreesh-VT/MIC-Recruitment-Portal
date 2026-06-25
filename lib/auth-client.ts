import { useSession, signIn, signOut } from "next-auth/react";

export interface SessionData {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  expires?: string;
}

export const authClient = {
  useSession: () => {
    const { data, status } = useSession();
    return {
      data: data as SessionData | null,
      isPending: status === "loading",
      error: null,
    };
  },
  signIn: {
    social: async ({ provider, callbackURL }: { provider: string; callbackURL: string }) => {
      return signIn(provider, { callbackUrl: callbackURL });
    },
  },
  signOut: async () => {
    return signOut();
  },
};
