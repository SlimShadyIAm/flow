from fastapi import FastAPI, HTTPException
from database import close_database, initialize_database, insert_event_data
from models import EventData, Events, EventResponse
from screenshot import capture_screenshot
from fastapi.middleware.cors import CORSMiddleware
import pyautogui

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify origins here or restrict to specific domains
    allow_methods=["*"],  # You can specify specific HTTP methods here, e.g., ["GET", "POST"]
    allow_headers=["*"],  # You can specify specific headers here, e.g., ["Content-Type", "Authorization"]
)

@app.post("/capture-screenshot/", response_model=EventResponse)
async def take_screenshot(event_data: EventData):
    try:
        # You can access the event data from the request's JSON body
        screenshot_filename = capture_screenshot()

        # Add the screenshot filename to the event data
        event_data.Screenshot_file = screenshot_filename

        # Call the insert_event_data function
        event = insert_event_data(event_data)

        return EventResponse(
            id=event.id,  # Replace with the actual ID
            time=event_data.timestamp,
            agent=event_data.agent,
            event=event_data.event,
            participant_id=event_data.participantId,
            old_value="" if event_data.oldValue is None else str(event_data.oldValue),
            new_value="" if event_data.newValue is None else str(event_data.newValue),
            screenshot_file=screenshot_filename  # Make sure this field is included
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Validation failed: " + str(e))


@app.get("/events/", response_model=list[EventResponse])
async def get_all_events():
    events = Events.select()
    return events

@app.get("/start-calibration/")
def start_calibration():
    pyautogui.hotkey('ctrl', 'alt', 'f10')
    return "Calibration started"
    # Press keys CTRL+ALT+F10 to start calibration

@app.on_event("startup")
async def startup_event():
    initialize_database()

@app.on_event("shutdown")
async def shutdown_event():
    close_database()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
