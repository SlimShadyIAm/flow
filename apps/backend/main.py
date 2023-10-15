from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from database import close_database, initialize_database, insert_event_data
from models import EventData, Events, EventResponse
from screenshot import capture_screenshot

app = FastAPI()


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
            time=event_data.Time,
            agent=event_data.Agent,
            event=event_data.Event,
            participant_id=str(event_data.Participant_ID),
            old_value="" if event_data.Old_Value is None else str(event_data.Old_Value),
            new_value="" if event_data.New_Value is None else str(event_data.New_Value),
            screenshot_file=screenshot_filename  # Make sure this field is included
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Validation failed: " + str(e))


@app.get("/events/", response_model=list[EventResponse])
async def get_all_events():
    events = Events.select()
    return events

@app.on_event("startup")
async def startup_event():
    initialize_database()

@app.on_event("shutdown")
async def shutdown_event():
    close_database()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
