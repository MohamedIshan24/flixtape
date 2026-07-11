"""
Seeds 5 specific, named TV series with ALL their seasons and episodes from TMDB:
Breaking Bad, Game of Thrones, Dark, Money Heist, Better Call Saul.

This will make a LOT of TMDB API calls (one per season, one per series) — expect
this to take a few minutes and produce a large number of movies/episodes.

Usage:
    1. Make sure your backend is running: uvicorn app.main:app --reload
    2. Confirm ADMIN_EMAIL / ADMIN_PASSWORD below match your admin login
    3. Run: python seed_specific_series.py
"""

import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
API_BASE = "http://localhost:8000"
TMDB_BASE = "https://api.themoviedb.org/3"

ADMIN_EMAIL = "isthikanmohammed@gmail.com"
ADMIN_PASSWORD = "ish123"

SERIES_NAMES = [
    "Breaking Bad",
    "Game of Thrones",
    "Dark",
    "Money Heist",
    "Better Call Saul",
]

GENRE_NAME_OVERRIDES = {
    "Family": "Kids & Family",
}

tmdb_headers = {
    "Authorization": f"Bearer {TMDB_API_KEY}",
    "accept": "application/json",
}


def get_admin_token():
    res = requests.post(f"{API_BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    res.raise_for_status()
    return res.json()["access_token"]


def search_series(name):
    res = requests.get(f"{TMDB_BASE}/search/tv", headers=tmdb_headers, params={"query": name})
    res.raise_for_status()
    results = res.json()["results"]
    if not results:
        raise Exception(f"No TMDB results found for: {name}")
    return results[0]  # best match


def get_series_details(series_id):
    res = requests.get(f"{TMDB_BASE}/tv/{series_id}", headers=tmdb_headers)
    res.raise_for_status()
    return res.json()


def get_series_credits(series_id):
    res = requests.get(f"{TMDB_BASE}/tv/{series_id}/credits", headers=tmdb_headers)
    res.raise_for_status()
    return res.json()


def get_season_details(series_id, season_number):
    res = requests.get(f"{TMDB_BASE}/tv/{series_id}/season/{season_number}", headers=tmdb_headers)
    res.raise_for_status()
    return res.json()


def get_or_create_genre(name, existing_genres, headers):
    if name in existing_genres:
        return existing_genres[name]
    res = requests.post(f"{API_BASE}/genres/", json={"name": name}, headers=headers)
    if res.status_code == 201:
        genre = res.json()
        existing_genres[name] = genre["id"]
        return genre["id"]
    res = requests.get(f"{API_BASE}/genres/", headers=headers)
    for g in res.json():
        if g["name"] == name:
            existing_genres[name] = g["id"]
            return g["id"]
    raise Exception(f"Failed to create or find genre: {name}")


def get_or_create_cast_member(name, existing_cast, headers):
    if name in existing_cast:
        return existing_cast[name]
    res = requests.post(f"{API_BASE}/cast-members/", json={"name": name}, headers=headers)
    if res.status_code == 201:
        member = res.json()
        existing_cast[name] = member["id"]
        return member["id"]
    res = requests.get(f"{API_BASE}/cast-members/", headers=headers)
    for c in res.json():
        if c["name"] == name:
            existing_cast[name] = c["id"]
            return c["id"]
    raise Exception(f"Failed to create or find cast member: {name}")


def main():
    if not TMDB_API_KEY:
        raise ValueError("TMDB_API_KEY not set in .env")

    print("Logging in as admin...")
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("Fetching existing Flixtape genres...")
    existing_genres_res = requests.get(f"{API_BASE}/genres/", headers=headers)
    existing_genres = {g["name"]: g["id"] for g in existing_genres_res.json()}

    print("Fetching existing Flixtape cast members...")
    existing_cast_res = requests.get(f"{API_BASE}/cast-members/", headers=headers)
    existing_cast = {c["name"]: c["id"] for c in existing_cast_res.json()}

    for series_name in SERIES_NAMES:
        print(f"\n=== Searching for: {series_name} ===")
        search_result = search_series(series_name)
        tmdb_id = search_result["id"]
        name = search_result["name"]
        print(f"Found: {name} (TMDB ID: {tmdb_id})")

        details = get_series_details(tmdb_id)
        credits = get_series_credits(tmdb_id)

        genre_ids = []
        for g in details.get("genres", []):
            mapped_name = GENRE_NAME_OVERRIDES.get(g["name"], g["name"])
            genre_id = get_or_create_genre(mapped_name, existing_genres, headers)
            genre_ids.append(genre_id)

        cast_member_ids = []
        for cast_entry in credits.get("cast", [])[:5]:
            cast_id = get_or_create_cast_member(cast_entry["name"], existing_cast, headers)
            cast_member_ids.append(cast_id)

        poster_path = details.get("poster_path")
        backdrop_path = details.get("backdrop_path")

        movie_payload = {
            "title": details["name"],
            "description": details.get("overview") or None,
            "release_year": int(details["first_air_date"][:4]) if details.get("first_air_date") else None,
            "duration": None,
            "video_url": None,
            "trailer_url": None,
            "thumbnail_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "banner_url": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
            "director": None,
            "type": "series",
            "genre_ids": genre_ids,
            "cast_member_ids": cast_member_ids,
        }

        res = requests.post(f"{API_BASE}/movies/", json=movie_payload, headers=headers)
        if res.status_code != 201:
            print(f"  Failed to create series ({res.status_code}): {name} - {res.text}")
            continue

        movie_id = res.json()["id"]
        print(f"  Created series: {name}")

        # Get all real seasons (skip "season 0" specials)
        seasons_list = [s for s in details.get("seasons", []) if s["season_number"] > 0]

        for season_summary in seasons_list:
            season_number = season_summary["season_number"]
            print(f"  Processing Season {season_number}...")

            season_data = get_season_details(tmdb_id, season_number)
            time.sleep(0.2)  # gentle pacing to avoid rate limits

            season_payload = {
                "season_number": season_number,
                "title": season_data.get("name") or f"Season {season_number}",
            }
            season_res = requests.post(
                f"{API_BASE}/movies/{movie_id}/seasons", json=season_payload, headers=headers
            )
            if season_res.status_code != 201:
                print(f"    Failed to create season {season_number}: {season_res.status_code} - {season_res.text}")
                continue

            season_id = season_res.json()["id"]

            episodes = season_data.get("episodes", [])
            for ep in episodes:
                still_path = ep.get("still_path")
                episode_payload = {
                    "episode_number": ep["episode_number"],
                    "title": ep["name"],
                    "description": ep.get("overview") or None,
                    "duration": ep.get("runtime") or None,
                    "video_url": None,
                    "thumbnail_url": f"https://image.tmdb.org/t/p/w500{still_path}" if still_path else None,
                }
                ep_res = requests.post(
                    f"{API_BASE}/seasons/{season_id}/episodes", json=episode_payload, headers=headers
                )
                if ep_res.status_code != 201:
                    print(f"      Failed episode {ep['episode_number']}: {ep_res.status_code} - {ep_res.text}")

            print(f"    Season {season_number}: added {len(episodes)} episodes")

    print("\nDone seeding all specific series.")


if __name__ == "__main__":
    main()