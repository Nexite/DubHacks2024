import Auth0Provider from "next-auth/providers/auth0";
import type { NextAuthOptions } from "next-auth";

export const nextAuthOptions: NextAuthOptions = {
    providers: [
        Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID!,
            clientSecret: process.env.AUTH0_CLIENT_SECRET!,
            issuer: process.env.AUTH0_ISSUER,
            authorization: {
                params: {
                    prompt: "login"
                }
            },
        }),
    ],
    callbacks: {
        session: async ({ session, token }) => {
            session!.user!.sub = token.sub || "";
            return session;
        },
    },
    debug: true,
    // Add any additional NextAuth configuration options here
}