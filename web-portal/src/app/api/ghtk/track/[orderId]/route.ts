import { NextRequest, NextResponse } from "next/server";

const GHTK_TOKEN = process.env.GHTK_TOKEN || "4AOoFQtg7ATfwWu7sGYz5D8ICC1jCussWrBt6KS";
const GHTK_BASE = "https://services.giaohangtietkiem.vn/services/v4";

function mockTracking(orderId: string) {
  const statuses = [
    { status: "Đơn hàng đã được tiếp nhận", time: "2026-07-04 10:00", location: "Kho Tân Bình" },
    { status: "Đang xử lý", time: "2026-07-04 10:30", location: "Kho Tân Bình" },
    { status: "Đang trên đường giao", time: "2026-07-04 14:00", location: "Đang giao" },
  ];
  return {
    success: true,
    mock: true,
    tracking_code: `GHTK-${orderId}`,
    status: "Đang giao",
    events: statuses,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    const res = await fetch(`${GHTK_BASE}/order/${orderId}/get-order-info`, {
      headers: { Token: GHTK_TOKEN },
    });

    if (!res.ok) {
      return NextResponse.json(mockTracking(orderId));
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      tracking_code: data.order?.tracking || null,
      status: data.order?.status || "Unknown",
      events: data.order?.status_history?.map((s: Record<string, string>) => ({
        status: s.status || s.display,
        time: s.updated_at || s.created_at || "",
        location: s.location || "",
      })) || [],
    });
  } catch {
    return NextResponse.json(mockTracking(orderId));
  }
}
