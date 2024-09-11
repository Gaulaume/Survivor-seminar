from fastapi import FastAPI
from routers import employees, customers, encounters, tips, events, clothes, compatibility, ai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(encounters.router, prefix="/api/encounters", tags=["encounters"])
app.include_router(tips.router, prefix="/api/tips", tags=["tips"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(clothes.router, prefix="/api/clothes", tags=["clothes"])
app.include_router(compatibility.router, prefix="/api/compatibility", tags=["compatibility"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
