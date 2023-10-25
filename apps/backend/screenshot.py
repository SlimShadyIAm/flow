from mss import mss
import uuid

def capture_screenshot():
    # Store the screenshot in a folder named screenshots
    # Generate a unique identifier for the screenshot filename
    # The unique identifier can be referenced in the database
    folder = "screenshots"
    screenshotID = uuid.uuid4()
    screenshot_filename = f"{folder}/{screenshotID}.png"

    with mss() as sct:
        sct.shot(output=screenshot_filename)

    return screenshot_filename
