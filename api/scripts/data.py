import pandas as pd
import numpy as np

# Function to determine stress level based on rules
def determine_stress_rules(row):
    if row['heart_rate'] > 85 or row['steps'] < 5000 or row['sleep_hours'] < 6:
        return 'High'
    elif (row['heart_rate'] > 70 and row['heart_rate'] <= 85) or (row['steps'] >= 5000 and row['steps'] < 10000) or (row['sleep_hours'] >= 6 and row['sleep_hours'] < 7):
        return 'Medium'
    else:
        return 'Low'

# Generate random data
np.random.seed(0)  # For reproducibility
num_samples = 1000

data = {
    'heart_rate': np.random.randint(50, 110, size=num_samples),
    'steps': np.random.randint(2000, 15000, size=num_samples),
    'sleep_hours': np.random.uniform(2, 9, size=num_samples)
}

# Create DataFrame
df = pd.DataFrame(data)

# Apply rules-based stress level determination
df['stress_level'] = df.apply(determine_stress_rules, axis=1)

# Save the dataset to CSV
df.to_csv('./stressdata.csv', index=False)

print(f"Dataset with {num_samples} rows generated and saved as 'stress_data.csv'")
