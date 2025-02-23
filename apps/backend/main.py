import time
from typing import List
from fastapi import APIRouter, FastAPI, HTTPException
from database import close_database, initialize_database, insert_event_data
from models import EventData, Events, EventResponse
from screenshot import capture_screenshot
from fastapi.middleware.cors import CORSMiddleware
import pyautogui
import subprocess
import tobiilsl.tobii_tracking as tobii

PROCESS = None


class API:
    tobii: None

    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route(
            "/capture-screenshot/",
            self.take_screenshot,
            methods=["POST"],
            response_model=EventResponse,
            description="Receive log, capture screenshot, and store in database."
        )
        self.router.add_event_handler("startup", self.startup_event)
        self.router.add_event_handler("shutdown", self.shutdown_event)
        self.router.add_api_route("/events/", self.get_all_events, methods=["GET"])

    async def take_screenshot(self, event_data: EventData):
        try:
            print(event_data)
            if event_data.event == "SELECT_TREATMENT":
                self.tobii = tobii.Tobii(event_data.participantId)
            elif event_data.event == "OPEN_BOOK":
                self.tobii.start_tracking(event_data.timestamp)
            elif event_data.event == "CLOSE_BOOK":
                self.tobii.stop_tracking(event_data.timestamp)
            
            # You can access the event data from the request's JSON body
            time.sleep(0.5)
            screenshot_filename = capture_screenshot()

            # Add the screenshot filename to the event data
            event_data.Screenshot_file = screenshot_filename

            # Call the insert_event_data function
            event = insert_event_data(event_data)


            return EventResponse(
                id=event.id,  # Replace with the actual ID
                timestamp=event_data.timestamp,
                agent=event_data.agent,
                event=event_data.event,
                participant_id=event_data.participantId,
                old_value=""
                if event_data.oldValue is None
                else str(event_data.oldValue),
                new_value=""
                if event_data.newValue is None
                else str(event_data.newValue),
                screenshot_file=screenshot_filename,  # Make sure this field is included
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail="Validation failed: " + str(e))

    async def get_all_events(self):
        events = Events.select()
        return events

    async def startup_event(self):
        initialize_database()
        
        import os
        if not os.path.exists("eye_tracker_data"):
            os.makedirs("eye_tracker_data")
        if not os.path.exists("screenshots"):
            os.makedirs("screenshots")

    async def shutdown_event(self):
        close_database()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify origins here or restrict to specific domains
    allow_methods=[
        "*"
    ],  # You can specify specific HTTP methods here, e.g., ["GET", "POST"]
    allow_headers=[
        "*"
    ],  # You can specify specific headers here, e.g., ["Content-Type", "Authorization"]
)
app.include_router(API().router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
