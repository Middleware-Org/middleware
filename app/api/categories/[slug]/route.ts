/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { updateCategory, deleteCategory, getCategoryBySlug } from "@/lib/github/categories";

/* **************************************************
 * GET - Ottieni una categoria specifica
 **************************************************/
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/* **************************************************
 * PUT - Aggiorna una categoria
 **************************************************/
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { name, description } = body;

    const category = await updateCategory(slug, { name, description });
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/* **************************************************
 * DELETE - Elimina una categoria
 **************************************************/
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    await deleteCategory(slug);

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    
    // Se l'errore è relativo alle relazioni, restituisci 409 Conflict
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const isRelationError = errorMessage.includes("used by");
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isRelationError ? 409 : 500 },
    );
  }
}

