from sqlalchemy.orm import sessionmaker
from database.connection import engine
# This is our connection link to the DB we import it to our controllers then use it as db = SessionLocal()
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)