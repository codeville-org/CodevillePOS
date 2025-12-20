import { useElectronAPI } from "@/hooks/use-electron-api";
import { GetSecurityResponseT } from "@/lib/zod/security.zod";

export async function loginHandler(
  username: string,
  password: string
): Promise<GetSecurityResponseT> {
  const electron = useElectronAPI();

  const loginResponse = await electron.security.login(username, password);

  return loginResponse;
}
