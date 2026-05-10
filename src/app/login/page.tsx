// Auth was removed. This route just redirects home so old bookmarks still work.
import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/");
}
