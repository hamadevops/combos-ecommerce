import { useProfile } from "@/hooks/useProfile";
import { useShopSettings } from "@/hooks/useShopSettings";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useProfile();
  useShopSettings();
  return <>{children}</>;
};
