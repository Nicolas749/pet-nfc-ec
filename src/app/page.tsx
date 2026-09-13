import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir directamente al panel de administración para este MVP
  redirect("/admin");
}
