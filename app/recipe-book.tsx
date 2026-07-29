"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const creators = ["Christian", "Jude", "Kate", "Kennedy", "Paige"];
const bases = ["Kava", "Kratom", "Coffee"];
type Ingredient = { amount: string; name: string };
type Recipe = { id: string; creator: string; name: string; base: string; ingredients: Ingredient[]; preparation: string; notes: string };

export default function RecipeBook() {
  const [view, setView] = useState<"add" | "browse">("add");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [creator, setCreator] = useState("");
  const [name, setName] = useState("");
  const [base, setBase] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ amount: "", name: "" }]);
  const [preparation, setPreparation] = useState("");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("All");
  const [baseFilter, setBaseFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadRecipes() {
    const response = await fetch("/api/recipes");
    if (response.ok) setRecipes(await response.json());
  }
  useEffect(() => { void loadRecipes(); }, []);

  function updateIngredient(index: number, key: keyof Ingredient, value: string) {
    setIngredients(rows => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!creator || !name.trim() || !base) return;
    setSaving(true);
    const response = await fetch("/api/recipes", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ creator, name: name.trim(), base, ingredients: ingredients.filter(i => i.amount || i.name), preparation, notes }),
    });
    setSaving(false);
    if (!response.ok) return;
    setCreator(""); setName(""); setBase(""); setIngredients([{ amount: "", name: "" }]); setPreparation(""); setNotes("");
    await loadRecipes(); setView("browse");
  }

  async function deleteRecipe(recipe: Recipe) {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
    setDeletingId(recipe.id);
    const response = await fetch(`/api/recipes?id=${encodeURIComponent(recipe.id)}`, { method: "DELETE" });
    setDeletingId(null);
    if (response.ok) setRecipes(current => current.filter(item => item.id !== recipe.id));
  }

  const filtered = useMemo(() => recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(query.toLowerCase()) &&
    (creatorFilter === "All" || recipe.creator === creatorFilter) &&
    (baseFilter === "All" || recipe.base === baseFilter)
  ), [recipes, query, creatorFilter, baseFilter]);

  return <div className="page-shell">
    <header className="brand">
      <img src="/muddy-root-logo.png" alt="The Muddy Root logo" />
      <div><p>Recipe Book</p><h1>The Muddy <em>Root</em></h1></div>
    </header>
    <nav className="tabs" aria-label="Recipe book views">
      <button className={view === "add" ? "active" : ""} onClick={() => setView("add")}>Add Recipe</button>
      <button className={view === "browse" ? "active" : ""} onClick={() => setView("browse")}>Browse</button>
    </nav>
    {view === "add" ? <main><form onSubmit={submit}>
      <label>Created By *</label>
      <select value={creator} onChange={e => setCreator(e.target.value)} required><option value="" disabled>Select your name...</option>{creators.map(c => <option key={c}>{c}</option>)}</select>
      <label>Recipe Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Muddy Sunrise" required />
      <fieldset><legend>Base *</legend><div className="choice-row">{bases.map(b => <button type="button" key={b} className={base === b ? "selected" : ""} onClick={() => setBase(b)}>{b}</button>)}</div></fieldset>
      <fieldset><legend>Flavors &amp; Ingredients</legend><div className="ingredient-head"><span>Amount</span><span>Flavor / Ingredient</span></div>
        {ingredients.map((item, index) => <div className="ingredient-row" key={index}><input aria-label={`Ingredient ${index + 1} amount`} value={item.amount} onChange={e => updateIngredient(index, "amount", e.target.value)} placeholder="2 oz" /><input aria-label={`Ingredient ${index + 1} name`} value={item.name} onChange={e => updateIngredient(index, "name", e.target.value)} placeholder="e.g. Fresh lime juice" /><button type="button" aria-label="Remove row" onClick={() => setIngredients(rows => rows.length === 1 ? [{ amount: "", name: "" }] : rows.filter((_, i) => i !== index))}>×</button></div>)}
        <button className="add-row" type="button" onClick={() => setIngredients(rows => [...rows, { amount: "", name: "" }])}>+ Add ingredient</button>
      </fieldset>
      <label>Preparation</label><textarea value={preparation} onChange={e => setPreparation(e.target.value)} placeholder="Describe the method — shaken, stirred, blended, any special steps..." />
      <label>Notes &amp; Variations</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Garnishes, substitutions, pairing ideas..." />
      <button className="save" disabled={!creator || !name.trim() || !base || saving}>{saving ? "Saving…" : "Save Recipe"}</button>
    </form></main> : <main className="browse-view">
      <label>Search by Drink Name</label><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search recipes..." />
      <Filter title="Filter by Creator" items={["All", ...creators]} value={creatorFilter} setValue={setCreatorFilter} />
      <Filter title="Filter by Base" items={["All", ...bases]} value={baseFilter} setValue={setBaseFilter} />
      <section className="recipes">{filtered.length ? filtered.map(recipe => <article key={recipe.id}><div className="recipe-card-head"><div><span>{recipe.base}</span><h2>{recipe.name}</h2><p>Created by {recipe.creator}</p></div><button className="delete-recipe" type="button" disabled={deletingId === recipe.id} aria-label={`Delete ${recipe.name}`} onClick={() => void deleteRecipe(recipe)}>{deletingId === recipe.id ? "Deleting…" : "Delete"}</button></div>{recipe.ingredients.length > 0 && <ul>{recipe.ingredients.map((i, n) => <li key={n}><b>{i.amount}</b> {i.name}</li>)}</ul>}{recipe.preparation && <p><strong>Preparation</strong><br />{recipe.preparation}</p>}{recipe.notes && <p><strong>Notes &amp; Variations</strong><br />{recipe.notes}</p>}</article>) : <div className="empty"><img src="/muddy-root-logo.png" alt="" /><p>{recipes.length ? "No recipes match those filters." : "No recipes yet — add your first one!"}</p></div>}</section>
    </main>}
  </div>;
}

function Filter({ title, items, value, setValue }: { title: string; items: string[]; value: string; setValue: (value: string) => void }) {
  return <fieldset className="filters"><legend>{title}</legend><div>{items.map(item => <button type="button" key={item} className={value === item ? "selected" : ""} onClick={() => setValue(item)}>{item}</button>)}</div></fieldset>;
}
