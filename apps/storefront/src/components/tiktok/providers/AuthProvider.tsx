import { useProfile } from "@/hooks/useProfile";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useProfile();
  return <>{children}</>;
};
