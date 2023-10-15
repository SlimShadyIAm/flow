from fastapi import FastAPI, Request
from pydantic import BaseModel
from mss import mss

app = FastAPI()


class EventData(BaseModel):
    Time: str
    Agent: str
    Event: str
    Participant_ID: int
    Old_Value: str = None
    New_Value: str = None


def capture_screenshot(event_data: EventData):
    # Save it to a folder named screenshots
    folder = "screenshots"
    screenshot_filename = f"{folder}/{event_data.Time}.png"

    with mss() as sct:
        sct.shot(output=screenshot_filename)

    # After taking the screenshot, you can do further processing if needed
    return screenshot_filename


@app.post("/capture-screenshot/")
async def take_screenshot(event_data: EventData):
    # You can access the event data from the request's JSON body
    screenshot_filename = capture_screenshot(event_data)

    return {
        "message": "Screenshot taken and saved successfully",
        "screenshot_filename": screenshot_filename,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
