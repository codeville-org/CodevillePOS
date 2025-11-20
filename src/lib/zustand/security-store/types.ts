import { SelectUserSchema } from "@/lib/zod/user.zod";

interface ResponseInterface {
  success: boolean;
  message: string;
}

export interface SecurityStoreInterface {
  // Types
  user: SelectUserSchema | null;
  isAuthenticated: boolean;
  latestLoginFootprint: Date | null;

  // Actions
  validateAuth: () => ResponseInterface;
  login: (username: string, password: string) => Promise<ResponseInterface>;
  logout: () => ResponseInterface;
  lock: () => ResponseInterface;
}
