import { auth } from "@/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await auth();
  return <NavbarClient username={session?.user?.name ?? null} />;
}
