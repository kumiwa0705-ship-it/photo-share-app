"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setIsLoggedIn(true);
        setEmail(user.signInDetails?.loginId ?? null);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  const signOut = async () => {
    await amplifySignOut();
    setIsLoggedIn(false);
    setEmail(null);
  };

  return { isLoggedIn, email, signOut };
}