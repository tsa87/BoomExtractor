from fastapi import APIRouter, Query
from typing import Dict, Any
import httpx

router = APIRouter()

OPENALEX_BASE = "https://api.openalex.org/works"

@router.get("/paper-graph")
async def paper_graph(title: str = Query(..., description="Paper title to search for")) -> Dict[str, Any]:
    """
    Given a paper title, fetch related papers and build a citation graph using OpenAlex.
    """
    async with httpx.AsyncClient() as client:
        # Search for the paper by title
        resp = await client.get(OPENALEX_BASE, params={"search": title, "per-page": 1})
        resp.raise_for_status()
        data = resp.json()
        if not data.get("results"):
            return {"nodes": [], "edges": []}
        main_paper = data["results"][0]
        main_id = main_paper["id"]
        main_title = main_paper["display_name"]
        # Get references (cited works)
        cited_ids = main_paper.get("referenced_works", [])[:5]  # limit for demo
        nodes = [{"id": main_id, "label": main_title, "main": True}]
        edges = []
        # Fetch cited papers
        for cited_id in cited_ids:
            cited_resp = await client.get(cited_id)
            cited_resp.raise_for_status()
            cited = cited_resp.json()
            nodes.append({"id": cited["id"], "label": cited["display_name"]})
            edges.append({"from": main_id, "to": cited["id"], "type": "cites"})
        return {"nodes": nodes, "edges": edges} 