from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
<<<<<<< HEAD
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Example of a parameterized query helper
def execute_query(db, query_string, params):
    result = db.execute(text(query_string), params)
    return result
=======
from database.connection import engine
# This is our connection link to the DB we import it to our controllers then use it as db = SessionLocal()
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
>>>>>>> 04d7caa38b298cc533674caaf304de53943fb572
