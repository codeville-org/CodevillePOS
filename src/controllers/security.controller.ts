import { getDB } from "@/database";
import { GetSecurityResponseT } from "@/lib/zod/security.zod";
import { decrypt } from "@/shared/utils/auth-util";

// ================= Login Controller =================
export async function loginController(
  username: string,
  password: string
): Promise<GetSecurityResponseT> {
  try {
    const db = getDB();

    // Get user by username
    const user = await db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.username, username)
    });

    if (!user) throw new Error("Sorry, Username not found!");

    // Check if the passed password matches the stored password
    const decryptedPassword = decrypt(user.password);

    if (password === decryptedPassword) {
      return {
        data: { message: "Login successful", user },
        success: true,
        error: null
      };
    } else throw new Error("Sorry, Password is incorrect!");
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}
