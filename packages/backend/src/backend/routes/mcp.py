from fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.routing import Route

mcp = FastMCP("Patchbay")


@mcp.tool()
def run_pipeline(pipeline_name: str, input_data: str) -> dict[str, str]:
    """Triggers a designated visual pipeline run from Patchbay."""
    print(f"Executing pipeline: {pipeline_name} with payload.")
    return {
        "status": "success",
        "processed_by": pipeline_name,
        "output": f"Patchbay executed context successfully for: {input_data[:30]}...",
    }


sse = SseServerTransport("/mcp/messages/")


async def handle_sse(request: Request) -> None:
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await mcp._mcp_server.run(
            streams[0],
            streams[1],
            mcp._mcp_server.create_initialization_options(),
        )


async def handle_messages(request: Request) -> None:
    await sse.handle_post_message(request.scope, request.receive, request._send)


mcp_app = Starlette(
    routes=[
        Route("/sse", endpoint=handle_sse),
        Route("/messages/", endpoint=handle_messages, methods=["POST"]),
    ],
)
