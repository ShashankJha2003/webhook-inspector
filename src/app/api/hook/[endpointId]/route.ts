import { eventEmitter } from "@/lib/events";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ endpointId: string }> }
) {
  try {
    const { endpointId } = await context.params;

    // 1. Check if this letterbox exists; if not, create it automatically
    let endpoint = await prisma.endpoint.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      endpoint = await prisma.endpoint.create({
        data: { id: endpointId },
      });
    }

    // 2. Read headers (sender info)
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    // 3. Read query params (e.g. ?token=123)
    const searchParamsObj = Object.fromEntries(req.nextUrl.searchParams.entries());

    // 4. Safely read the body (the actual payload)
    let parsedBody: any = null;
    let rawText: string | null = null;

    try {
      rawText = await req.text();
      parsedBody = rawText ? JSON.parse(rawText) : null;
    } catch {
      // If it's not valid JSON, rawText still preserves the original message
    }

    // 5. File the letter away in Neon PostgreSQL
    const savedEvent = await prisma.webhookEvent.create({
      data: {
        endpointId: endpoint.id,
        method: req.method,
        headers: headersObj,
        queryParams: searchParamsObj,
        body: parsedBody ?? undefined,
        rawBody: rawText,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    eventEmitter.emit(`event:${endpointId}`, savedEvent);

    // 6. Return a success confirmation
    return NextResponse.json(
      {
        success: true,
        message: "Webhook delivered successfully",
        eventId: savedEvent.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook receiver error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Allow GET, PUT, and DELETE requests to be captured as well
export { POST as GET, POST as PUT, POST as DELETE };