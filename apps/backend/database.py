from peewee import SqliteDatabase
from models import EventData, Events

# Define the SQLite database connection
db = SqliteDatabase('events.db')

# Initialize the database and create tables if they don't exist
def initialize_database():
    db.connect()
    db.create_tables([Events], safe=True)  # Use "safe=True" to avoid errors if tables already exist

# Insert event data into the database
def insert_event_data(event_data: EventData):
    return Events.create(
        time=event_data.Time,
        agent=event_data.Agent,
        event=event_data.Event,
        participant_id=event_data.Participant_ID,
        old_value=event_data.Old_Value,
        new_value=event_data.New_Value,
        screenshot_file=event_data.Screenshot_file
    )

# Close the database connection
def close_database():
    db.close()
