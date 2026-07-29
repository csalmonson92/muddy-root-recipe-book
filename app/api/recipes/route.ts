import { env } from "cloudflare:workers";
import { isStaffAuthenticated } from "../../staff-auth";

const schema = `CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, creator TEXT NOT NULL, name TEXT NOT NULL, base TEXT NOT NULL, ingredients TEXT NOT NULL, preparation TEXT NOT NULL, notes TEXT NOT NULL, created_at INTEGER NOT NULL)`;

async function ready() { await env.DB.prepare(schema).run(); }

export async function GET() {
  if (!await isStaffAuthenticated()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ready();
  const result = await env.DB.prepare("SELECT id, creator, name, base, ingredients, preparation, notes FROM recipes ORDER BY created_at DESC").all();
  return Response.json(result.results.map((r: Record<string, unknown>) => ({ ...r, ingredients: JSON.parse(String(r.ingredients)) })));
}

export async function POST(request: Request) {
  if (!await isStaffAuthenticated()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { creator?: string; name?: string; base?: string; ingredients?: unknown[]; preparation?: string; notes?: string };
  if (!body.creator || !body.name || !body.base) return Response.json({ error: "Missing required fields" }, { status: 400 });
  await ready();
  const recipe = { id: crypto.randomUUID(), creator: body.creator, name: body.name, base: body.base, ingredients: body.ingredients ?? [], preparation: body.preparation ?? "", notes: body.notes ?? "" };
  await env.DB.prepare("INSERT INTO recipes (id, creator, name, base, ingredients, preparation, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(recipe.id, recipe.creator, recipe.name, recipe.base, JSON.stringify(recipe.ingredients), recipe.preparation, recipe.notes, Date.now()).run();
  return Response.json(recipe, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!await isStaffAuthenticated()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Recipe id is required" }, { status: 400 });
  await ready();
  const result = await env.DB.prepare("DELETE FROM recipes WHERE id = ?").bind(id).run();
  if (!result.meta.changes) return Response.json({ error: "Recipe not found" }, { status: 404 });
  return Response.json({ deleted: true });
}
