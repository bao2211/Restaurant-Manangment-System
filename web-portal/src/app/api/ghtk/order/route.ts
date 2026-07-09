import { NextRequest, NextResponse } from "next/server";

const GHTK_TOKEN = process.env.GHTK_TOKEN || "DGJX3w5h4wbFRsqnHEYbzUK8XHKBJnZJyQNFfm";
const GHTK_BASE = "https://services-staging.ghtklab.com/services";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mock } = body;

  if (mock) {
    return NextResponse.json({
      success: true,
      mock: true,
      tracking_code: `GHTK-MOCK-${Date.now()}`,
      order_id: body.order_id || `MOCK-${Date.now()}`,
    });
  }

  try {
    const res = await fetch(`${GHTK_BASE}/shipment/order`, {
      method: "POST",
      headers: {
        Token: GHTK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        mock: true,
        tracking_code: `GHTK-FALLBACK-${Date.now()}`,
        order_id: body.order?.id || body.order_id,
        message: "GHTK API unavailable, using fallback",
      });
    }

    const data = await res.json();
    return NextResponse.json({
      success: data.success !== false,
      tracking_code: data.order?.tracking_id || data.order?.tracking_code || null,
      tracking_id: data.order?.tracking_id || null,
      label: data.order?.label || null,
      fee: data.order?.fee || null,
      order_id: data.order?.partner_id || body.order_id,
    });
  } catch {
    return NextResponse.json({
      success: true,
      mock: true,
      tracking_code: `GHTK-FALLBACK-${Date.now()}`,
      tracking_id: null,
      order_id: body.order?.id || body.order_id,
      message: "GHTK API unreachable, using fallback",
    });
  }
}
