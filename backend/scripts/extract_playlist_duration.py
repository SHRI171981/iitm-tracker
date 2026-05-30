import asyncio
import httpx
import re
import sys
from urllib.parse import urlparse, parse_qs
from config import YOUTUBE_API_KEY, YOUTUBE_PLAYLIST_ITEMS_URL, YOUTUBE_VIDEOS_URL

DURATION_REGEX = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')


def extract_playlist_id(url: str) -> str:
    parsed_url = urlparse(url)
    if parsed_url.query:
        qs = parse_qs(parsed_url.query)
        if "list" in qs:
            return qs["list"][0]
    return url


async def fetch_playlist_video_ids(playlist_id: str, client: httpx.AsyncClient) -> list[str]:
    video_ids = []
    next_page_token = ""

    while True:
        params = {
            "part": "contentDetails",
            "playlistId": playlist_id,
            "maxResults": 50,
            "key": YOUTUBE_API_KEY,
            "pageToken": next_page_token
        }
        response = await client.get(YOUTUBE_PLAYLIST_ITEMS_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        video_ids.extend([item["contentDetails"]["videoId"] for item in data.get("items", [])])
        
        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    return video_ids


async def fetch_batched_durations(video_ids: list[str], client: httpx.AsyncClient) -> int:
    chunk_size = 50
    id_chunks = [",".join(video_ids[i:i + chunk_size]) for i in range(0, len(video_ids), chunk_size)]

    async def fetch_chunk(chunk: str) -> int:
        chunk_seconds = 0
        params = {
            "part": "contentDetails",
            "id": chunk,
            "key": YOUTUBE_API_KEY
        }
        response = await client.get(YOUTUBE_VIDEOS_URL, params=params)
        response.raise_for_status()
        
        for item in response.json().get("items", []):
            match = DURATION_REGEX.match(item["contentDetails"]["duration"])
            if match:
                hours = int(match.group(1) or 0)
                minutes = int(match.group(2) or 0)
                seconds = int(match.group(3) or 0)
                chunk_seconds += (hours * 3600) + (minutes * 60) + seconds
        return chunk_seconds

    tasks = [fetch_chunk(chunk) for chunk in id_chunks]
    results = await asyncio.gather(*tasks)
    return sum(results)


async def calculate_total_hours(url: str) -> float:
    playlist_id = extract_playlist_id(url)
    async with httpx.AsyncClient() as client:
        video_ids = await fetch_playlist_video_ids(playlist_id, client)
        if not video_ids:
            return 0.0
        total_seconds = await fetch_batched_durations(video_ids, client)
        return int(round(total_seconds / 3600.0))


if __name__ == "__main__":
    playlist_url="https://www.youtube.com/playlist?list=PLZ2ps__7DhBbLzN1YMVO67miZP26eUYcR"
    total_hours = asyncio.run(calculate_total_hours(playlist_url))
    print(f"{total_hours}")