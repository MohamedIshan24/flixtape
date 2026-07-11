"""
One-time script to seed the Flixtape database with real movie data from TMDB.
This calls your own running API (http://localhost:8000) as an admin user —
it does not touch the database directly, so all your normal validation applies.

Usage:
    1. Make sure your backend is running: uvicorn app.main:app --reload
    2. Set ADMIN_EMAIL / ADMIN_PASSWORD below to your real admin login
    3. Run: python seed_movies.py
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
API_BASE = "http://localhost:8000"
TMDB_BASE = "https://api.themoviedb.org/3"

ADMIN_EMAIL = "isthikanmohammed@gmail.com"
ADMIN_PASSWORD = "ish123"

MOVIE_COUNT = 50

# Map TMDB genre names to your own genre names (rename "Family" to match our kids filter)
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


def get_tmdb_genres():
    res = requests.get(f"{TMDB_BASE}/genre/movie/list", headers=tmdb_headers)
    res.raise_for_status()
    return {g["id"]: g["name"] for g in res.json()["genres"]}


def get_popular_movies(count):
    movies = []
    page = 1
    while len(movies) < count:
        res = requests.get(
            f"{TMDB_BASE}/movie/popular",
            headers=tmdb_headers,
            params={"page": page},
        )
        res.raise_for_status()
        movies.extend(res.json()["results"])
        page += 1
    return movies[:count]


def get_movie_details(movie_id):
    res = requests.get(f"{TMDB_BASE}/movie/{movie_id}", headers=tmdb_headers)
    res.raise_for_status()
    return res.json()


def get_movie_credits(movie_id):
    res = requests.get(f"{TMDB_BASE}/movie/{movie_id}/credits", headers=tmdb_headers)
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
    else:
        # Might already exist due to race/dupe; re-fetch
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
    else:
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

    print("Fetching TMDB genre list...")
    tmdb_genres = get_tmdb_genres()

    print("Fetching existing Flixtape genres...")
    existing_genres_res = requests.get(f"{API_BASE}/genres/", headers=headers)
    existing_genres = {g["name"]: g["id"] for g in existing_genres_res.json()}

    print("Fetching existing Flixtape cast members...")
    existing_cast_res = requests.get(f"{API_BASE}/cast-members/", headers=headers)
    existing_cast = {c["name"]: c["id"] for c in existing_cast_res.json()}

    print(f"Fetching {MOVIE_COUNT} popular movies from TMDB...")
    popular_movies = get_popular_movies(MOVIE_COUNT)

    for i, movie_summary in enumerate(popular_movies, start=1):
        tmdb_id = movie_summary["id"]
        title = movie_summary["title"]
        print(f"[{i}/{MOVIE_COUNT}] Processing: {title}")

        details = get_movie_details(tmdb_id)
        credits = get_movie_credits(tmdb_id)

        genre_ids = []
        for g in details.get("genres", []):
            mapped_name = GENRE_NAME_OVERRIDES.get(g["name"], g["name"])
            genre_id = get_or_create_genre(mapped_name, existing_genres, headers)
            genre_ids.append(genre_id)

        cast_member_ids = []
        for cast_entry in credits.get("cast", [])[:5]:  # top 5 billed cast
            cast_id = get_or_create_cast_member(cast_entry["name"], existing_cast, headers)
            cast_member_ids.append(cast_id)

        director = next(
            (c["name"] for c in credits.get("crew", []) if c["job"] == "Director"),
            None,
        )

        poster_path = details.get("poster_path")
        backdrop_path = details.get("backdrop_path")

        payload = {
            "title": details["title"],
            "description": details.get("overview") or None,
            "release_year": int(details["release_date"][:4]) if details.get("release_date") else None,
            "duration": details.get("runtime") or None,
            "video_url": None,
            "trailer_url": None,
            "thumbnail_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "banner_url": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
            "director": director,
            "type": "movie",
            "genre_ids": genre_ids,
            "cast_member_ids": cast_member_ids,
        }

        res = requests.post(f"{API_BASE}/movies/", json=payload, headers=headers)
        if res.status_code == 201:
            print(f"    Added: {title}")
        else:
            print(f"    Failed ({res.status_code}): {title} - {res.text}")

    print("Done seeding movies.")


if __name__ == "__main__":
    main()