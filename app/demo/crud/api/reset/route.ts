import { NextRequest, NextResponse } from "next/server";
import { resetDatabase } from "../../lib/db/init";

export const dynamic = "force-dynamic";

/**
 * POST /api/reset - Reset database to seed data
 */
export async function POST() {
  try {
    await resetDatabase();
    return NextResponse.json({ success: true, message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset database" },
      { status: 500 }
    );
  }
}
