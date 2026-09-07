// src/app/api/events/[endpointId]/sse/route.ts
import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ endpointId: string }> }
) {
  const { endpointId } = await context.params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const listener = (eventData: any) => {
        const payload = `data: ${JSON.stringify(eventData)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      eventEmitter.on(`event:${endpointId}`, listener);

      // Clean up the listener if the client closes the connection
      req.signal.addEventListener("abort", () => {
        eventEmitter.off(`event:${endpointId}`, listener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}