from datetime import datetime
import json

from IPython.display import display
from PIL import Image
import numpy as np

from peewee import IntegerField, Model, CharField, SqliteDatabase, AutoField

db = SqliteDatabase("events.db")


class Events(Model):
    id = AutoField(primary_key=True)
    time = IntegerField()
    agent = CharField()
    event = CharField()
    participant_id = IntegerField()
    old_value = CharField(null=True)
    new_value = CharField(null=True)
    screenshot_file = CharField(null=True)

    class Meta:
        database = db


def show_screenshot_for_record(_id):
    events = (
        Events.select().where(Events.id == _id).order_by(Events.time.asc()).limit(1)
    )
    if len(events) == 0:
        print("No events found for id: ", _id)
        return
    event = events[0]
    image_path = event.screenshot_file
    print(_id)
    display(Image.open(image_path))


X_PIXELS = 2560
Y_PIXELS = 1440
TIMESTAMP_IDENT = "system_time_stamp"
OFFSET = 10_000_000
DEGREES_PER_PIXEL = np.rad2deg(np.arctan((0.336 / Y_PIXELS) / 0.6))


def extract_gaze_data_between_timestamps(gaze_data, start_time, end_time):
    # gaze data is the entire json file
    # lower and upper bound are in seconds

    T_start = start_time
    T_end = end_time

    gaze_data_start_time = gaze_data["start_time"]
    # parse timestamp from format YYYY-MM-DD HH:MM:SS
    gaze_data_start_time = datetime.strptime(gaze_data_start_time, "%Y-%m-%d %H:%M:%S")
    # convert to unix timestamp
    T_G_start = datetime.timestamp(gaze_data_start_time)

    T_offset_start = T_start - T_G_start
    T_offset_start = T_offset_start * 1_000_000

    T_offset_end = T_end - T_G_start
    T_offset_end = T_offset_end * 1_000_000

    T_D_start = gaze_data["data"][0][TIMESTAMP_IDENT]

    lower_bound = T_D_start + T_offset_start + OFFSET
    upper_bound = T_D_start + T_offset_end + OFFSET

    # get all data between lower and upper bound
    gaze_data_between_timestamps = [
        packet
        for packet in gaze_data["data"]
        if packet[TIMESTAMP_IDENT] >= lower_bound
        and packet[TIMESTAMP_IDENT] <= upper_bound
    ]

    return gaze_data_between_timestamps


def extract_gaze_data_between_timestamps_proper(gaze_data, start_time, end_time):
    # gaze data is the entire json file
    # start_time and end_time are in milliseconds
    # Deepy copy gaze_data
    gaze_data = gaze_data.copy()

    T_s_0 = gaze_data["data"][0][TIMESTAMP_IDENT]  # microseconds
    system_start_time_mono = (
        gaze_data["system_start_time_mono"] / 1_000
    )  # convert nanoseconds to microseconds
    delta = T_s_0 - system_start_time_mono
    system_start_time_epoch = (
        gaze_data["system_start_time_epoch"] * 1_000_000
    )  # convert seconds to microseconds
    T_E_0 = system_start_time_epoch + delta

    T_x = start_time * 1_000  # convert milliseconds to microseconds
    T_y = end_time * 1_000  # convert milliseconds to microseconds
    lower_bound = T_s_0 + (T_x - T_E_0)
    upper_bound = T_s_0 + (T_y - T_E_0)

    # get all data between lower and upper bound
    gaze_data["data"] = [
        packet
        for packet in gaze_data["data"]
        if packet[TIMESTAMP_IDENT] >= lower_bound
        and packet[TIMESTAMP_IDENT] <= upper_bound
    ]

    return gaze_data


def find_gaze_packet_at_timestamp(gaze_data, timestamp, properties_to_check_validity):
    # gaze data is the entire json file
    # timestamp is in milliseconds

    T_s_0 = gaze_data["data"][0][TIMESTAMP_IDENT] # microseconds
    system_start_time_mono = gaze_data['system_start_time_mono']  / 1_000 # convert nanoseconds to microseconds
    delta = T_s_0 - system_start_time_mono
    system_start_time_epoch = gaze_data['system_start_time_epoch'] * 1_000_000 # convert seconds to microseconds
    T_E_0 = system_start_time_epoch + delta

    T_x = timestamp * 1_000 # convert milliseconds to microseconds
    lower_bound = T_s_0 +  (T_x - T_E_0)

    # get all data between lower and upper bound
    gaze_data_at_timestamp = next((
        packet
        for packet in gaze_data["data"]
        if packet[TIMESTAMP_IDENT] >= lower_bound
        and all(packet[prop] == 1 for prop in properties_to_check_validity)
    ))

    return gaze_data_at_timestamp


def print_record(record):
    print(
        record.id,
        record.time,
        record.agent,
        record.event,
        record.participant_id,
        record.old_value,
        record.new_value,
        record.screenshot_file,
    )


def show_screenshot_for_record(_id):
    events = Events.select().where(Events.id == _id).order_by(Events.time.asc()).limit(1)
    if len(events) == 0:
        print("No events found for id: ", _id)
        return
    event = events[0]
    image_path = event.screenshot_file
    print(_id)
    display(Image.open(image_path))


def show_participant_screenshots(participant_events):
    for event in participant_events:
        image_path = event.screenshot_file
        print_record(event)
        display(Image.open(image_path))

def is_participant_data_low_resolution(participant_id):
    # read participants.json
    with open("participants.json", "r") as f:
        participants = json.load(f)
    
    participant = participants.get(str(participant_id))
    if participant is None:
        return False
    
    low_res = participant.get("low_resolution")
    if low_res is None:
        return False
    else:
        return low_res

def load_participants_metadata():
    # read participants.json
    with open("participants.json", "r") as f:
        participants = json.load(f)

    return participants
    
def get_participant_treatment(participant_id):
    # read participants.json
    with open("participants.json", "r") as f:
        participants = json.load(f)
    
    participant = participants.get(str(participant_id))
    if participant is None:
       raise Exception(f"Participant {participant_id} not found in participants.json")
    
    split = participant.get("split")
    group = participant.get("group")
    if split is None or group is None:
        raise Exception(f"Participant {participant_id} does not have a treatment")
    
    return f"Treatment {split},{group}"

def load_treatment_settings(treatment):
    # read participants.json
    with open("treatments.json", "r") as f:
        treatments = json.load(f)
    
    treatment = next((t for t in treatments if treatment in t['name']), None)
    if treatment is None:
        raise Exception(f"Treatment {treatment} not found in treatments.json")
    
    return treatment

def get_participant_dominant_eye(participant_id):
    # read participants.json
    with open("participants.json", "r") as f:
        participants = json.load(f)
    
    participant = participants.get(str(participant_id))
    if participant is None:
        print(f"Participant {participant_id} not found in participants.json, defaulting to right eye")
        return "right"
    
    eye = participant.get("dominant_eye")
    if eye is None:
        print(f"Participant {participant_id} does not have a dominant eye, defaulting to right eye")
        return "right"
    else:
        return eye.lower()


def merge_databases(other_database_name):
    ###
    db = SqliteDatabase("events.db")
    db.connect()
    db.execute_sql(
        f"""
        ATTACH '{other_database_name}' AS db2;
        INSERT INTO events (
            time,
            agent,
            event,
            participant_id,
            old_value,
            new_value,
            screenshot_file
        )
        SELECT
            time,
            agent,
            event,
            participant_id,
            old_value,
            new_value,
            screenshot_file
        FROM db2.events;
        DETACH db2;
        """
    )
