# Calculate the population statistics for the participants in participants.json
### SAMPLE DATA ###
#     "1": {
#         "split": 1,
#         "group": 1,
#         "age": 32,
#         "dominant_eye": "Left"
#     },
#     "2": {
#         "split": 1,
#         "group": 2,
#         "age": 26,
#         "dominant_eye": "Left"
#     },

import json
f = open("participants.json", "r")
participants = json.load(f)
f.close()

# Get the ages of the participants, some are null
ages = [participants[participant]["age"] for participant in participants]
# Remove the null values
ages = [age for age in ages if age is not None]

# Get the range of the ages
print(f"Age range: {min(ages)} to {max(ages)}")

# Calculate the mean age
mean_age = sum(ages) / len(ages)
print(f"Mean age: {mean_age}")

# Calculate the median age
sorted_ages = sorted(ages)
middle_index = len(sorted_ages) // 2
median_age = sorted_ages[middle_index]
print(f"Median age: {median_age}")

# Calculate the standard deviation of the ages
sum_of_squared_differences = 0
for age in ages:
    difference = age - mean_age
    squared_difference = difference ** 2
    sum_of_squared_differences += squared_difference
variance = sum_of_squared_differences / len(ages)
standard_deviation = variance ** 0.5
print(f"Standard deviation of age: {standard_deviation}")


# Split age into two groups, one > 32 and one <= 32
age_groups = [[], []]
for age in ages:
    if age > 32:
        age_groups[0].append(age)
    else:
        age_groups[1].append(age)

# Calculate the mean age of each group
mean_age_groups = []
for age_group in age_groups:
    mean_age_groups.append(sum(age_group) / len(age_group))

# Calculate the standard deviation of each group
standard_deviation_groups = []
for age_group in age_groups:
    sum_of_squared_differences = 0
    for age in age_group:
        difference = age - mean_age_groups[age_groups.index(age_group)]
        squared_difference = difference ** 2
        sum_of_squared_differences += squared_difference
    variance = sum_of_squared_differences / len(age_group)
    standard_deviation_groups.append(variance ** 0.5)

# Calculate the t-statistic
mean_difference = mean_age_groups[0] - mean_age_groups[1]
standard_error = (
    (standard_deviation_groups[0] ** 2 / len(age_groups[0]))
    + (standard_deviation_groups[1] ** 2 / len(age_groups[1]))
) ** 0.5

t_statistic = mean_difference / standard_error
print(f"Range of age in group 1: {min(age_groups[0])} to {max(age_groups[0])}")
print(f"Range of age in group 2: {min(age_groups[1])} to {max(age_groups[1])}")
print(f"Mean: {mean_age_groups}")
print(f"Standard deviation: {standard_deviation_groups}")
print(f"t-statistic: {t_statistic}")
