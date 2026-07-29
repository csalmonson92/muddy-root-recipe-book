import RecipeBook from "./recipe-book";
import StaffGate from "./staff-gate";
import { isStaffAuthenticated } from "./staff-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  return await isStaffAuthenticated() ? <RecipeBook /> : <StaffGate />;
}
