import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete("kgvoa_logged_in");
  cookieStore.delete("user_name");
  cookieStore.delete("user_role");

  return NextResponse.json({
    status: "success",
  });
}