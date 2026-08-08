# Assign_Rules.py
import pandas as pd

# Load the dataset
data = pd.read_csv("./stress_data.csv")

# Function to determine stress level
def determine_stress(row):
    if row['heart_rate'] > 85 or row['steps'] < 5000 or row['sleep_hours'] < 6:
        return 'High'
    elif (row['heart_rate'] > 70 and row['heart_rate'] <= 85) or (row['steps'] >= 5000 and row['steps'] < 10000) or (row['sleep_hours'] >= 6 and row['sleep_hours'] < 7):
        return 'Medium'
    else:
        return 'Low'
# Apply the function to the dataset
data['stress_level'] = data.apply(determine_stress, axis=1)

# Save the new dataset with stress levels
data.to_csv('stress_data.csv', index=False)