# This file will have functions to set up the eye-tracker from tobii.
# Also, it should have functions that start subscribing to data from the eye-tracker.
# And it should have functions that stop subscribing to data from the eye-tracker.

license_file = "license_file"


import tobii_research as tr
import json

setup: bool = False


def setup_eye_tracker() -> tr.EyeTracker:
    # Find Eye Tracker and Apply License (edit to suit actual tracker serial no)
    trackers = tr.find_all_eyetrackers()
    if len(trackers) == 0:
        print("No Eye Trackers found!?")
        exit(1)

    # Pick first tracker
    tracker = trackers[0]
    print("Found Tobii Tracker at '%s'" % (tracker.address))

    # Apply license
    if license_file != "":
        import os

        with open(os.path.join("tobiilsl", "license_file"), "rb") as f:
            license = f.read()

            res = tracker.apply_licenses(license)
            # Returns: Tuple of FailedLicense objects for licenses that failed.
            # Empty tuple if all licenses were successfully applied.

            if len(res) == 0:
                print("Successfully applied license from single key")
                setup = True
                return tracker
            else:
                print(
                    "Failed to apply license from single key. Validation result: %s."
                    % (res[0].validation_result)
                )
                exit
    else:
        print("No license file found")


def start_tracking(tracker: tr.EyeTracker):
    if (not setup):
        print("Eye tracker not setup")
        exit(1)

    tracker.subscribe_to(
        tr.EYETRACKER_GAZE_DATA, gaze_data_callback, as_dictionary=True
    )
    return True

def stop_tracking(tracker: tr.EyeTracker):
    if (not setup):
        print("Eye tracker not setup")
        exit(1)

    tracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_data_callback)
    
    return True


gaze_datas = []

def gaze_data_callback(gaze_data):
    gaze_datas.append(json.dumps(gaze_data))


if __name__ == "__main__":
    setup_eye_tracker()
