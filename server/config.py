import os
import argparse

from util.provider import Provider

class Config:
    def __init__(self, user_data, provider, supabase_url, supabase_key):
        self.user_data = user_data
        self.provider = provider
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key        

def load_config():
    parser = argparse.ArgumentParser()

    parser.add_argument("--user-data")
    parser.add_argument("--provider")

    args = parser.parse_args()

    user_data = os.getenv('USER_DATA') or args.user_data
    if not user_data:
        raise RuntimeError("user data path is missing. cannot do config setup")
    
    provider = Provider.from_str(os.getenv('PROVIDER') or args.provider)
    if not provider:
        raise RuntimeError("provider is missing. cannot do config setup")
    
    supabase_url = os.getenv("SUPABASE_URL", "")
    if supabase_url == "":
        raise RuntimeError("Supabase URL not set")
    
    supabase_key = os.getenv("SUPABASE_KEY", "")
    if supabase_key == "":
        raise RuntimeError("Supabase KEY not set")
    
    return Config(user_data=user_data, provider=provider, supabase_url=supabase_url, supabase_key=supabase_key)
