"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      },
    },
  },
  { ssr: true }
);

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
);

export default function ConfigureAmplify() {
  return null;
}