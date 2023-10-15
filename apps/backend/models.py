from pydantic import BaseModel

class EventData(BaseModel):
    Time: str
    Agent: str
    Event: str
    Participant_ID: int
    Old_Value: int | str = None
    New_Value: int | str = None
    Screenshot_file: str = None

class EventResponse(BaseModel):
    id: int
    time: str
    agent: str
    event: str
    participant_id: str
    old_value: str
    new_value: str
    screenshot_file: str


from peewee import Model, CharField, SqliteDatabase, AutoField
db = SqliteDatabase('events.db')

class Events(Model):
    id = AutoField()
    time = CharField()
    agent = CharField()
    event = CharField()
    participant_id = CharField()
    old_value = CharField(null=True)
    new_value = CharField(null=True)
    screenshot_file = CharField(null=True)

    class Meta:
        database = db
