"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Save which member is using this device, then go to the Tonight view. */
export async function pickMember(formData: FormData) {
  const memberId = String(formData.get("member_id") ?? "");
  if (!memberId) return;

  const c = await cookies();
  c.set("hyetas_member_id", memberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: ONE_YEAR,
    path: "/",
  });

  revalidatePath("/");
  redirect("/");
}
