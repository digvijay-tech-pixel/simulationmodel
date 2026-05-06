from fastapi import FastAPI, Query, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from covid_simulation import run_seir_simulation, districts
from database import engine, SessionLocal, Base
from models import User

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="COVID-19 SEIR Simulation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"

class UserResponse(BaseModel):
    username: str
    role: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Simple token implementation for demo (normally use JWT)
    # Here we are just looking up the username as the token for simplicity,
    # OR we can just use the actual user lookup. Let's use username as token for now
    # to avoid complex JWT setup if not strictly needed, or we can use python-jose.
    pass

# We will use simple token logic: the token is just the username for this demo
# to keep dependencies simple and robust.
def get_current_user_simple(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.post("/api/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Return username as token for simplicity
    return {"access_token": user.username, "token_type": "bearer", "role": user.role}

@app.get("/api/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user_simple)):
    return {"username": current_user.username, "role": current_user.role}


# --- Simulation Endpoints ---

@app.get("/api/simulate")
def simulate(
    beta: float = Query(0.35, description="Infection Rate (beta)"),
    inc_days: float = Query(5.1, description="Incubation Period (days)"),
    inf_days: float = Query(10.0, description="Days Infectious"),
    initial_infected: int = Query(10, description="Initial Infected"),
    population: int = Query(1752000, description="Total Population")
):
    df = run_seir_simulation(beta, inc_days, inf_days, initial_infected, population)
    
    # We need to return the full dataset for the line chart
    # AND we need to aggregate the deaths for the bar chart
    
    # 1. Full Line Chart Data
    line_data = df.to_dict(orient="records")
    
    # 2. Aggregated Bar Chart Data (every 4 weeks = 28 days)
    weeks_interval = 28
    week_indices = list(range(0, 365, weeks_interval))
    df_weeks = df.iloc[week_indices]
    
    bar_data = []
    for index, row in df_weeks.iterrows():
        bar_data.append({
            "week": f"Wk {int(row['day']/7)}",
            "young": row['deaths_young'],
            "adult": row['deaths_adult'],
            "elderly": row['deaths_elderly']
        })

    return {
        "line_data": line_data,
        "bar_data": bar_data
    }

@app.get("/api/districts")
def get_districts_data():
    return districts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
