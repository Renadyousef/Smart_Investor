from database.session import engine
from sqlalchemy import text

def check():
    print("Checking database tables...")
    with engine.connect() as conn:
        try:
            # Check table existence
            res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [r[0] for r in res.fetchall()]
            print(f"Tables in public schema: {tables}")
            
            if 'portfolio_holdings' in tables:
                res = conn.execute(text("SELECT * FROM portfolio_holdings"))
                holdings = res.fetchall()
                print(f"Total holdings in database: {len(holdings)}")
                for h in holdings:
                    print(h)
            else:
                print("Table 'portfolio_holdings' DOES NOT EXIST!")
                
        except Exception as e:
            print(f"Error during check: {e}")

if __name__ == "__main__":
    check()
