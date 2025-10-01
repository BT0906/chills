import { UserContext, type UserContextType } from "@/contexts/user-context";
import { useContext } from "react";

export const useUser = (): UserContextType => {
  return useContext(UserContext);
};
