from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/", response_model=schemas.AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(get_current_admin_user),
):
    # Most watched: distinct profiles per movie, top 10
    most_watched_rows = (
        db.query(
            models.Movie.id,
            models.Movie.title,
            func.count(func.distinct(models.WatchHistory.profile_id)).label("value"),
        )
        .join(models.WatchHistory, models.WatchHistory.movie_id == models.Movie.id)
        .group_by(models.Movie.id, models.Movie.title)
        .order_by(func.count(func.distinct(models.WatchHistory.profile_id)).desc())
        .limit(10)
        .all()
    )
    most_watched = [
        schemas.MovieStatOut(id=row.id, title=row.title, value=row.value)
        for row in most_watched_rows
    ]

    # Most rated: actual average rating (from Rating table), not just count
    most_rated_rows = (
        db.query(
            models.Movie.id,
            models.Movie.title,
            func.avg(models.Rating.rating).label("average_rating"),
            func.count(models.Rating.id).label("rating_count"),
        )
        .join(models.Rating, models.Rating.movie_id == models.Movie.id)
        .group_by(models.Movie.id, models.Movie.title)
        .order_by(func.avg(models.Rating.rating).desc())
        .limit(10)
        .all()
    )
    most_rated = [
        schemas.MovieAvgRatingOut(
            id=row.id,
            title=row.title,
            average_rating=round(float(row.average_rating), 1),
            rating_count=row.rating_count,
        )
        for row in most_rated_rows
    ]

    # Signups over time: last 12 months, grouped by month
    signup_rows = (
        db.query(
            func.to_char(models.User.created_at, "YYYY-MM").label("month"),
            func.count(models.User.id).label("count"),
        )
        .group_by(func.to_char(models.User.created_at, "YYYY-MM"))
        .order_by(func.to_char(models.User.created_at, "YYYY-MM"))
        .all()
    )
    signups_over_time = [
        schemas.SignupPoint(month=row.month, count=row.count) for row in signup_rows
    ][-12:]

    # Active subscriptions by plan
    plan_rows = (
        db.query(models.User.subscription_plan, func.count(models.User.id))
        .filter(models.User.subscription_status == "active")
        .group_by(models.User.subscription_plan)
        .all()
    )
    active_subscriptions_by_plan = [
        schemas.PlanBreakdown(plan=plan.value, count=count) for plan, count in plan_rows
    ]

    return schemas.AnalyticsOut(
        most_watched=most_watched,
        most_rated=most_rated,
        signups_over_time=signups_over_time,
        active_subscriptions_by_plan=active_subscriptions_by_plan,
    )