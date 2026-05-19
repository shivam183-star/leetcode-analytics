from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd
import json
from datetime import datetime

app = FastAPI(title="LeetCode Analytics API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://alfa-leetcode-api.onrender.com/{}"

@app.get("/api/user/{username}")
def get_user_data(username: str):
    try:
        solved_resp = requests.get(BASE_URL.format(username) + "/solved", timeout=60)
        lang_resp = requests.get(BASE_URL.format(username) + "/language", timeout=60)
        cal_resp = requests.get(BASE_URL.format(username) + "/calendar", timeout=60)
        
        if solved_resp.status_code != 200 or lang_resp.status_code != 200 or cal_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch data from LeetCode API")

        solved_data = solved_resp.json()
        lang_data = lang_resp.json()
        calendar_json = cal_resp.json()

        if solved_data.get("solvedProblem") is None:
            raise HTTPException(status_code=404, detail="Invalid username!")

        # Basic Stats
        total_solved = solved_data.get("solvedProblem", 0)
        easy = solved_data.get("easySolved", 0)
        medium = solved_data.get("mediumSolved", 0)
        hard = solved_data.get("hardSolved", 0)
        
        accepted_list = solved_data.get("acSubmissionNum", [])
        total_list = solved_data.get("totalSubmissionNum", [])

        accepted_submissions = accepted_list[0].get("submissions", 0) if accepted_list else 0
        total_submissions = total_list[0].get("submissions", 0) if total_list else 0
        
        acceptance_rate = (accepted_submissions / total_submissions) * 100 if total_submissions > 0 else 0

        # Language Data
        language_stats = []
        for item in lang_data.get("languageProblemCount", []):
            language_stats.append({
                "language": item["languageName"],
                "count": item["problemsSolved"]
            })

        # Calendar Data
        submission_calendar_str = calendar_json.get("submissionCalendar", "{}")
        if not submission_calendar_str:
            submission_calendar_str = "{}"
        
        try:
            submission_calendar = json.loads(submission_calendar_str)
        except json.JSONDecodeError:
            submission_calendar = {}

        calendar_data = []
        for timestamp, count in submission_calendar.items():
            calendar_data.append({
                "date": pd.to_datetime(int(timestamp), unit='s'),
                "submissions": count
            })

        df = pd.DataFrame(calendar_data)
        
        if df.empty:
            return {
                "stats": {
                    "totalSolved": total_solved,
                    "totalSubmissions": total_submissions,
                    "acceptanceRate": round(acceptance_rate, 2),
                    "easy": easy,
                    "medium": medium,
                    "hard": hard
                },
                "languages": language_stats,
                "hasActivity": False
            }

        df["day"] = df["date"].dt.date
        df["week"] = df["date"].dt.isocalendar().week
        df["month"] = df["date"].dt.strftime("%Y-%m")
        df["year"] = df["date"].dt.year
        
        df["week_start"] = df["date"] - pd.to_timedelta(df["date"].dt.weekday, unit='d')
        df["week_end"] = df["week_start"] + pd.Timedelta(days=6)

        # Monthly
        monthly_df = df.groupby("month")["submissions"].sum().reset_index()
        monthly_df["month"] = pd.to_datetime(monthly_df["month"] + "-01").dt.strftime("%b-%Y")
        monthly_stats = monthly_df.to_dict("records")

        # Peak Activity
        daily_df = df.groupby("day")["submissions"].sum().reset_index()
        weekly_df = df.groupby(["week_start", "week_end"])["submissions"].sum().reset_index()
        
        most_active_day = daily_df.loc[daily_df["submissions"].idxmax()]
        most_active_week = weekly_df.loc[weekly_df["submissions"].idxmax()]
        most_active_month = monthly_df.loc[monthly_df["submissions"].idxmax()]

        # Streaks
        active_dates = sorted(df["day"].unique())
        max_streak = 0
        current_streak_temp = 1
        
        for i in range(1, len(active_dates)):
            prev_date = pd.to_datetime(active_dates[i - 1])
            curr_date = pd.to_datetime(active_dates[i])
            difference = (curr_date - prev_date).days

            if difference == 1:
                current_streak_temp += 1
            else:
                max_streak = max(max_streak, current_streak_temp)
                current_streak_temp = 1
                
        max_streak = max(max_streak, current_streak_temp)
        
        current_streak = 1
        if active_dates:
            for i in range(len(active_dates) - 1, 0, -1):
                curr_date = pd.to_datetime(active_dates[i])
                prev_date = pd.to_datetime(active_dates[i - 1])
                difference = (curr_date - prev_date).days

                if difference == 1:
                    current_streak += 1
                else:
                    break

        # Cumulative Weekly
        weekly_problem_df = df.groupby("week_start")["submissions"].sum().reset_index()
        full_week_range = pd.date_range(
            start=weekly_problem_df["week_start"].min(),
            end=pd.Timestamp.today(),
            freq="W-MON"
        )
        full_weeks_df = pd.DataFrame({"week_start": full_week_range})
        weekly_problem_df = full_weeks_df.merge(weekly_problem_df, on="week_start", how="left")
        weekly_problem_df["submissions"] = weekly_problem_df["submissions"].fillna(0)
        weekly_problem_df["cumulative_submissions"] = weekly_problem_df["submissions"].cumsum()
        
        trend_data = []
        for _, row in weekly_problem_df.iterrows():
            trend_data.append({
                "week": row["week_start"].strftime("%d-%b-%Y"),
                "cumulative": int(row["cumulative_submissions"]),
                "submissions": int(row["submissions"])
            })

        # Heatmap / daily
        daily_stats = []
        for _, row in daily_df.iterrows():
            daily_stats.append({
                "date": row["day"].strftime("%Y-%m-%d"),
                "count": int(row["submissions"])
            })

        return {
            "hasActivity": True,
            "stats": {
                "totalSolved": total_solved,
                "totalSubmissions": total_submissions,
                "acceptanceRate": round(acceptance_rate, 2),
                "easy": easy,
                "medium": medium,
                "hard": hard
            },
            "languages": language_stats,
            "monthly": monthly_stats,
            "peak": {
                "day": {
                    "date": pd.to_datetime(most_active_day["day"]).strftime("%d-%b-%Y"),
                    "submissions": int(most_active_day["submissions"])
                },
                "week": {
                    "date": f'{most_active_week["week_start"].strftime("%d-%b-%Y")} to {most_active_week["week_end"].strftime("%d-%b-%Y")}',
                    "submissions": int(most_active_week["submissions"])
                },
                "month": {
                    "date": most_active_month["month"],
                    "submissions": int(most_active_month["submissions"])
                }
            },
            "streaks": {
                "current": current_streak,
                "max": max_streak
            },
            "trend": trend_data,
            "daily": daily_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
