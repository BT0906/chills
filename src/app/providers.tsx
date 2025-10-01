import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/user-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <UserProvider>
          {children}
        </UserProvider>
      </ThemeProvider>
    </>
  )
};
