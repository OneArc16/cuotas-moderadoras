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
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "localhost:3001",
      "127.0.0.1:3000",
      "127.0.0.1:3001",
      "192.168.1.133:3001",
    ],
    protocol: "http",
  },
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