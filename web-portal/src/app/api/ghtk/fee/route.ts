import { NextRequest, NextResponse } from "next/server";

const GHTK_TOKEN = process.env.GHTK_TOKEN || "DGJX3w5h4wbFRsqnHEYbzUK8XHKBJnZJyQNFfm";
const GHTK_BASE = "https://services-staging.ghtklab.com/services";

function mockFee(province: string) {
  const isSameProvince = province === "Hồ Chí Minh";
  const baseFee = isSameProvince ? 22000 : 35000;
  const fuelSurcharge = Math.round(baseFee * 0.12);
  return {
    success: true,
    mock: true,
    fee: {
      fee: baseFee + fuelSurcharge,
      insurance_fee: 0,
      delivery: true,
      estimate: isSameProvince ? "1-2 ngày" : "3-5 ngày",
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("mock") === "true") {
    return NextResponse.json(mockFee(searchParams.get("province") || ""));
  }

  try {
    const params = new URLSearchParams();
    for (const [key, val] of searchParams.entries()) {
      if (key !== "mock") params.set(key, val);
    }
    params.set("weight", searchParams.get("weight") || "500");
    params.set("value", searchParams.get("value") || "100000");

    const res = await fetch(`${GHTK_BASE}/shipment/fee?${params}`, {
      headers: { Token: GHTK_TOKEN },
    });

    if (!res.ok) {
      return NextResponse.json(mockFee(searchParams.get("province") || ""));
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      fee: {
        fee: data.fee?.fee || 0,
        insurance_fee: data.fee?.insurance_fee || 0,
        delivery: data.fee?.delivery !== false,
        estimate: data.fee?.estimate || "",
      },
    });
  } catch {
    return NextResponse.json(mockFee(searchParams.get("province") || ""));
  }
}
