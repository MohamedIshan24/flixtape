def test_submit_rating_creates_rating(client, auth_headers, test_profile, test_movie):
    res = client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 8},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["rating"] == 8
    assert data["movie_id"] == str(test_movie.id)


def test_resubmit_rating_updates_existing(client, auth_headers, test_profile, test_movie):
    client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 5},
        headers=auth_headers,
    )
    res = client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 9},
        headers=auth_headers,
    )
    assert res.status_code == 201
    assert res.json()["rating"] == 9

    list_res = client.get(f"/profiles/{test_profile.id}/ratings/", headers=auth_headers)
    assert len(list_res.json()) == 1


def test_rating_out_of_range_fails(client, auth_headers, test_profile, test_movie):
    res = client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 15},
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_movie_average_updates_after_rating(client, auth_headers, test_profile, test_movie):
    client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 10},
        headers=auth_headers,
    )
    movie_res = client.get(f"/movies/{test_movie.id}")
    assert movie_res.json()["rating"] == 10
    assert movie_res.json()["rating_count"] == 1


def test_delete_rating(client, auth_headers, test_profile, test_movie):
    client.post(
        f"/profiles/{test_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 7},
        headers=auth_headers,
    )
    res = client.delete(f"/profiles/{test_profile.id}/ratings/{test_movie.id}", headers=auth_headers)
    assert res.status_code == 204

    get_res = client.get(f"/profiles/{test_profile.id}/ratings/{test_movie.id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_rating_someone_elses_profile_fails(client, db_session, test_movie):
    from app import models
    from app.auth_utils import hash_password

    other_user = models.User(email="other@test.com", hashed_password=hash_password("pass123"))
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_profile = models.Profile(user_id=other_user.id, name="Other Profile")
    db_session.add(other_profile)
    db_session.commit()
    db_session.refresh(other_profile)

    from app.auth_utils import create_access_token
    token = create_access_token(user_id=other_user.id)

    res = client.post(
        f"/profiles/{other_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201  # this IS their own profile, sanity check passes


def test_cannot_rate_using_another_users_profile_id(client, auth_headers, db_session, test_movie):
    from app import models
    from app.auth_utils import hash_password

    other_user = models.User(email="other2@test.com", hashed_password=hash_password("pass123"))
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_profile = models.Profile(user_id=other_user.id, name="Not Yours")
    db_session.add(other_profile)
    db_session.commit()
    db_session.refresh(other_profile)

    res = client.post(
        f"/profiles/{other_profile.id}/ratings/",
        json={"movie_id": str(test_movie.id), "rating": 5},
        headers=auth_headers,  # belongs to test_user, not other_user
    )
    assert res.status_code == 403