import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzbcCJzVI12vs2K_vHhTxUhyhMveb8TQU-lfJYds_PDWvkw1k5-aI-UtNI8T09_E5UA/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const mobile = body.mobile;
    const password = body.password;

    const response = await fetch(
      `${API_URL}?action=login&mobile=${encodeURIComponent(
        mobile
      )}&password=${encodeURIComponent(
        password
      )}`
    );

    const result = await response.json();

    if (result.status !== "success") {
      return NextResponse.json(result);
    }

    const cookieStore = await cookies();

    cookieStore.set(
      "kgvoa_logged_in",
      "true",
      {
        path: "/",
        httpOnly: true,
      }
    );

    cookieStore.set(
      "user_name",
      result.user.User_Name,
      {
        path: "/",
        httpOnly: true,
      }
    );

    cookieStore.set(
      "user_role",
      result.user.Role,
      {
        path: "/",
        httpOnly: true,
      }
    );

    return NextResponse.json({
  status: "success",
  user: result.user,
});

  } catch (error) {

    return NextResponse.json({
      status: "error",
      message: "Login failed",
    });

  }
}