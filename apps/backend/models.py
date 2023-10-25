from typing import Optional
from pydantic import BaseModel

class EventData(BaseModel):
    timestamp: str
    agent: str
    event: str
    participantId: int
    oldValue: Optional[int|str] = None
    newValue: Optional[int|str ]= None
    Screenshot_file: Optional[str] = None

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
