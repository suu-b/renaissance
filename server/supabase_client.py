import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if SUPABASE_URL == "" or SUPABASE_KEY == "":
    raise RuntimeError("Supabase URL or KEY not set")

def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)