import { UserProvider } from "@/contexts/user-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <UserProvider>{children}</UserProvider>;
};
