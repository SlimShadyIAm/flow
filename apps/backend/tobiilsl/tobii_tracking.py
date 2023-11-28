# This file will have functions to set up the eye-tracker from tobii.
# Also, it should have functions that start subscribing to data from the eye-tracker.
# And it should have functions that stop subscribing to data from the eye-tracker.

license_file = "license_file"


import datetime
import os
import time
import simplejson
import tobii_research as tr
import json

class Tobii:
    setup: bool = False
    tracker: tr.EyeTracker
    participantId: int
    start_time: datetime

    def __init__(self, participantId):
        self.participantId = participantId
        # Find Eye Tracker and Apply License (edit to suit actual tracker serial no)
        trackers = tr.find_all_eyetrackers()
        if len(trackers) == 0:
            print("No Eye Trackers found!?")
            exit(1)

        # Pick first tracker
        self.tracker = trackers[0]
        print("Found Tobii Tracker at '%s'" % (self.tracker.address))

        # Apply license
        if license_file != "":
            import os

            with open(os.path.join("tobiilsl", "license_file"), "rb") as f:
                license = f.read()

                res = self.tracker.apply_licenses(license)
                # Returns: Tuple of FailedLicense objects for licenses that failed.
                # Empty tuple if all licenses were successfully applied.

                if len(res) == 0:
                    print("Successfully applied license from single key")
                    self.setup = True
                else:
                    print(
                        "Failed to apply license from single key. Validation result: %s."
                        % (res[0].validation_result)
                    )
                    exit
        else:
            print("No license file found")

    # TODO: add the start_time as a parameter
    def start_tracking(self):
        if (not self.setup):
            print("Eye tracker not setup")
            exit(1)
        print("Tracking eye stuff")

        self.start_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") 

        self.tracker.subscribe_to(
            tr.EYETRACKER_GAZE_DATA, self.gaze_data_callback, as_dictionary=True
        )
        return True

    def stop_tracking(self):
        if (not self.setup):
            print("Eye tracker not setup")
            exit(1)

        self.tracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, 
                                      self.gaze_data_callback)
        print("Not Tracking eye stuff")
        # generate filename based on date and time
        filename = os.path.join("eye_tracker_data", f"[{self.participantId}]-{self.start_time}.json")
        print(f"Outputting to file {filename}...")
        # create data directory if it doesn't exist
        if not os.path.exists("eye_tracker_data"):
            os.makedirs("eye_tracker_data")
        
        data_to_write = {
            "participantId": self.participantId,
            "start_time": self.start_time,
            "data": self.gaze_datas
        }
        
        with open(filename, "w") as f:
            f.write(simplejson.dumps(data_to_write, ignore_nan=True))

        return True


    gaze_datas = []

    def gaze_data_callback(self, gaze_data):
        self.gaze_datas.append(gaze_data)


if __name__ == "__main__":
    tobii = Tobii(123)
    tobii.start_tracking()
    time.sleep(1)
    tobii.stop_tracking()

