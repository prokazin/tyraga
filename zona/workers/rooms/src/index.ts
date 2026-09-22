export { BrigadeRoom } from "./BrigadeRoom.js";

interface Env {
  BRIGADE: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const brigadeId = url.searchParams.get("brigadeId");

    if (!brigadeId) {
      return new Response(JSON.stringify({ error: "brigadeId_required" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    const id = env.BRIGADE.idFromName(brigadeId);
    const stub = env.BRIGADE.get(id);

    const forwarded = new URL(request.url);
    forwarded.searchParams.delete("brigadeId");
    forwarded.searchParams.delete("ws");

    const newRequest = new Request(forwarded.toString(), request);
    return stub.fetch(newRequest);
  }
};
