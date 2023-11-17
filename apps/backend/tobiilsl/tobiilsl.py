#
#
#
################################
# SETUP HERE
#

license_file = "license_file"

# DONT CHANGE BELOW



################################
# Preface here
#
# from psychopy import prefs, visual, core, event, monitors, tools, logging
import datetime
import json
import simplejson
import tobii_research as tr
import time
import os
import sys

# Find Eye Tracker and Apply License (edit to suit actual tracker serial no)
ft = tr.find_all_eyetrackers()
if len(ft) == 0:
    print("No Eye Trackers found!?")
    exit(1)

# Pick first tracker
mt = ft[0]
print("Found Tobii Tracker at '%s'" % (mt.address))


# Apply license
if license_file != "":
    import os
    with open(os.path.join("tobiilsl", "license_file"), "rb") as f:
        license = f.read()

        res = mt.apply_licenses(license)
        if len(res) == 0:
            print("Successfully applied license from single key")
        else:
            print("Failed to apply license from single key. Validation result: %s." % (res[0].validation_result))
            exit
else:
    print("No license file installed")

gaze_datas = set()
halted = False

def gaze_data_callback(gaze_data):
    '''send gaze data'''

    '''
    This is what we get from the tracker:

    device_time_stamp

    left_gaze_origin_in_trackbox_coordinate_system (3)
    left_gaze_origin_in_user_coordinate_system (3)
    left_gaze_origin_validity
    left_gaze_point_in_user_coordinate_system (3)
    left_gaze_point_on_display_area (2)
    left_gaze_point_validity
    left_pupil_diameter
    left_pupil_validity

    right_gaze_origin_in_trackbox_coordinate_system (3)
    right_gaze_origin_in_user_coordinate_system (3)
    right_gaze_origin_validity
    right_gaze_point_in_user_coordinate_system (3)

    right_gaze_point_on_display_area (2)
    right_gaze_point_validity
    right_pupil_diameter
    right_pupil_validity

    system_time_stamp
    '''

    try:
        global halted

        gaze_data['custom_timestamp'] = tr.get_system_time_stamp()
        gaze_datas.add(json.dumps(gaze_data))

        # print(unpack_gaze_data(gaze_data))
    except:
        print("Error in callback: ")
        print(sys.exc_info())

        halted = True


# Main loop; run until escape is pressed
mt.subscribe_to(tr.EYETRACKER_GAZE_DATA, gaze_data_callback, as_dictionary=True)

def handle_terminate(signum, fname):
    print("Subprocess received terminate signal. Performing cleanup...")

    global halted
    halted = True

    raise SystemExit

import time
import signal

signal.signal(signal.SIGTERM, handle_terminate)

try:
    while not halted:
        time.sleep(1)
        keys = ()  # event.getKeys()
        if len(keys) != 0:
            if keys[0]=='escape':
                halted = True

        if halted:
            break

except SystemExit:
    print("Halting...")
    # generate filename based on date and time
    date = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = os.path.join("eye_tracker_data", f"{date}.json")
    print(f"Outputting to file {filename}...")
    # create data directory if it doesn't exist
    if not os.path.exists("eye_tracker_data"):
        os.makedirs("eye_tracker_data")
    # write data to file
    with open(filename, "w") as f:
        gaze_datas = list(gaze_datas)
        gaze_datas = [json.loads(data) for data in gaze_datas]
        gaze_datas.sort(key=lambda data: data['custom_timestamp'])
        f.write(simplejson.dumps(gaze_datas, ignore_nan=True))
    print("Done.")

print("terminating tracking now")
mt.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_data_callback)
