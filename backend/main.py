from controller import root, board, like, subsribe, user, generate, community
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
load_dotenv()
origins = [os.getenv('FRONT_HOST1'),os.getenv('FRONT_HOST2')]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
static_dir = os.path.join(os.path.dirname(__file__), "images")
app.mount("/images", StaticFiles(directory=static_dir), name="images")
routes = [root.route, board.route, like.route, subsribe.route, user.route, generate.route, community.route]
for route in routes:
  app.include_router(route)
