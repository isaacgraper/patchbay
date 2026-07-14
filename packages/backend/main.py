import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.routing import Route

from backend.database.engine import init_db

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


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    yield


app = FastAPI(title="Patchbay", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

app.mount("/mcp", mcp_app)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("PATCHBAY_HOST", "0.0.0.0")
    port = int(os.getenv("PATCHBAY_PORT", "4333"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
