import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    status: "success",
  });

  response.cookies.set("kgvoa_logged_in", "", {
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("user_name", "", {
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("user_role", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}