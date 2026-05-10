// Auth was removed. Picker now lives on the home page.
import { redirect } from "next/navigation";

export default function ClaimPage() {
  redirect("/");
}
