import { Suspense } from "react";
import FavoritesClient from "@/components/FavoritesClient";

export const metadata = { title: "Favorites — ファヤの辞書" };

export default function FavoritesPage() {
  return (
    <Suspense>
      <FavoritesClient />
    </Suspense>
  );
}
