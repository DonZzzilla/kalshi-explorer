#!/usr/bin/env python3
"""Reverse proxy: routes / to service A (default 9118), /status to service B (default 9120).
Supports HTTP and WebSocket upgrades via aiohttp.

Usage: customize the port constants at the top, then run directly or via systemd.
Requires: aiohttp (available in hermes-agent venv)
"""

import aiohttp
from aiohttp import web
import asyncio

PROXY_PORT = 9119
SERVICE_A_URL = "http://127.0.0.1:9118"   # primary service (/)
SERVICE_B_URL = "http://127.0.0.1:9120"   # secondary service (/status)

HOP_HEADERS = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade",
}


def filter_headers(headers):
    return {k: v for k, v in headers.items() if k.lower() not in HOP_HEADERS}


def get_target(path):
    """Return (target_base_url, stripped_path) for the given request path."""
    if path == "/status" or path.startswith("/status/"):
        target_base = SERVICE_B_URL
        target_path = "/" if path == "/status" else path[len("/status"):]
    else:
        target_base = SERVICE_A_URL
        target_path = path
    return target_base, target_path


async def handle_websocket(request, target_url):
    """Proxy a WebSocket connection bidirectionally."""
    ws_server = web.WebSocketResponse()
    await ws_server.prepare(request)

    ws_target = target_url.replace("http://", "ws://").replace("https://", "wss://")

    try:
        async with request.app["session"].ws_connect(ws_target) as ws_client:
            async def forward(src, dst):
                async for msg in src:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        await dst.send_str(msg.data)
                    elif msg.type == aiohttp.WSMsgType.BINARY:
                        await dst.send_bytes(msg.data)
                    elif msg.type in (aiohttp.WSMsgType.CLOSE, aiohttp.WSMsgType.CLOSING):
                        await dst.close()
                        break
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        break

            await asyncio.gather(
                forward(ws_client, ws_server),
                forward(ws_server, ws_client),
            )
    except Exception:
        if not ws_server.closed:
            await ws_server.close()

    return ws_server


async def proxy(request):
    """Main proxy handler — detects WebSocket upgrade and routes accordingly."""
    path = request.path_qs
    target_base, target_path = get_target(path)

    is_ws = (
        request.headers.get("Upgrade", "").lower() == "websocket"
        or "websocket" in request.headers.get("Connection", "").lower()
    )

    if is_ws:
        return await handle_websocket(request, f"{target_base}{target_path}")

    target_url = f"{target_base}{target_path}"
    body = await request.read()
    headers = filter_headers(dict(request.headers))

    try:
        async with request.app["session"].request(
            method=request.method,
            url=target_url,
            headers=headers,
            data=body,
            allow_redirects=False,
        ) as resp:
            resp_headers = filter_headers(dict(resp.headers))
            resp_body = await resp.read()
            return web.Response(
                status=resp.status,
                headers=resp_headers,
                body=resp_body,
            )
    except aiohttp.ClientError as e:
        return web.Response(status=502, text=f"Bad Gateway: {e}")


async def on_startup(app):
    app["session"] = aiohttp.ClientSession()


async def on_cleanup(app):
    await app["session"].close()


def main():
    app = web.Application()
    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    app.router.add_route("*", "/{path_info:.*}", proxy)

    print(f"Reverse proxy listening on 127.0.0.1:{PROXY_PORT}")
    print(f"  /          -> {SERVICE_A_URL}")
    print(f"  /status/*  -> {SERVICE_B_URL}")
    web.run_app(app, host="127.0.0.1", port=PORT, print=None)


if __name__ == "__main__":
    main()
