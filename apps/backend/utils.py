from datetime import datetime

from matplotlib import pyplot as plt
from IPython.display import display
from PIL import Image


X_PIXELS = 2560
Y_PIXELS = 1440

def extract_gaze_data_between_timestamps(gaze_data, start_time, end_time):
  # gaze data is the entire json file
  # lower and upper bound are in seconds

  T_start = start_time
  T_end = end_time

  gaze_data_start_time = gaze_data['start_time']
  # parse timestamp from format YYYY-MM-DD HH:MM:SS
  gaze_data_start_time = datetime.strptime(gaze_data_start_time, "%Y-%m-%d %H:%M:%S")
  # convert to unix timestamp
  T_G_start = datetime.timestamp(gaze_data_start_time)

  T_offset_start = T_start - T_G_start
  T_offset_start = T_offset_start * 1_000_000

  T_offset_end = T_end - T_G_start
  T_offset_end = T_offset_end * 1_000_000

  T_D_start = gaze_data['data'][0]['system_time_stamp']

  lower_bound = T_D_start + T_offset_start
  upper_bound = T_D_start + T_offset_end

  # get all data between lower and upper bound
  gaze_data_between_timestamps = [packet for packet in gaze_data['data'] if packet['system_time_stamp'] >= lower_bound and packet['system_time_stamp'] <= upper_bound]

  return gaze_data_between_timestamps

def plot_gaze_data_on_screenshot(gaze_data, screenshot_path):
  fig, ax = plt.subplots(figsize=(X_PIXELS / 100, Y_PIXELS / 100))
  # set ax limits
  ax.set_xlim(0, X_PIXELS)
  ax.set_ylim(Y_PIXELS, 0)
  img = plt.imread(screenshot_path)

  # for each packet, plot the gaze point
  for packet in gaze_data:
    if packet['right_gaze_point_validity'] == 0:
      continue
    x = packet['right_gaze_point_on_display_area'][0] * X_PIXELS
    y = packet['right_gaze_point_on_display_area'][1] * Y_PIXELS

    ax.plot(x, y, 'ro', markersize=1)
    # we want to plot the gaze points as circles.
    # TODO: the points should have colors based on the time they were recorded

  ax.imshow(img, extent=[0, X_PIXELS, Y_PIXELS, 0])


def print_record(record):
    print(record.id, record.time, record.agent, record.event, record.participant_id, record.old_value, record.new_value, record.screenshot_file)


def show_participant_screenshots(participant_events):
  for event in participant_events:
    image_path = event.screenshot_file
    print_record(event)
    display(Image.open(image_path))
