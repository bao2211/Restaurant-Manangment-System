import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lon1 = searchParams.get("lon1");
  const lat1 = searchParams.get("lat1");
  const lon2 = searchParams.get("lon2");
  const lat2 = searchParams.get("lat2");

  if (!lon1 || !lat1 || !lon2 || !lat2) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson&steps=false`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Routing failed" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Routing service unreachable" }, { status: 502 });
  }
}
