import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, username } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";

const adminUserIds = process.env.BETTER_AUTH_ADMIN_USER_IDS
  ? process.env.BETTER_AUTH_ADMIN_USER_IDS.split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  : [];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    admin({
      adminUserIds,
    }),
  ],
});