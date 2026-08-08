import pandas as pd
import joblib
import json
import sys

# Load the pre-trained model
joblib_file = "pretrained_dt_model_stress.pkl"
dt_model_loaded = joblib.load(joblib_file)

print("Model loaded successfully")

# Function to determine stress level based on rules
def determine_stress_rules(row):
    if row['heart_rate'] > 85 or row['steps'] < 5000 or row['sleep_hours'] < 6:
        return 'High'
    elif (row['heart_rate'] > 70 and row['heart_rate'] <= 85) or (row['steps'] >= 5000 and row['steps'] < 10000) or (row['sleep_hours'] >= 6 and row['sleep_hours'] < 7):
        return 'Medium'
    else:
        return 'Low'

# New data with heart rate, steps, and hours of sleep
# new_data = pd.DataFrame({
#     'heart_rate': [94, 97, 53, 53, 71],
#     'steps': [13522, 9500, 10819, 6485, 6289],
#     'sleep_hours': [3.88, 7.6, 7.7, 6.4, 8.24],
# })

def main():
    # Read input data from stdin
    input_data = json.loads(sys.stdin.read())
    
    heart_rate = input_data.get('heart_rate')
    steps = input_data.get('steps')
    sleep_hours = input_data.get('sleep_hours')

    # New data with heart rate, steps, and hours of sleep
    new_data = pd.DataFrame({
        'heart_rate': [heart_rate],
        'steps': [steps],
        'sleep_hours': [sleep_hours],
    })

    # Apply rules-based stress level determination
    new_data['stress_level_rules'] = new_data.apply(determine_stress_rules, axis=1)

    # Make predictions on the new data using the model
    predicted_stress = dt_model_loaded.predict(new_data[['heart_rate', 'steps', 'sleep_hours']])[0]
    predicted_probability = dt_model_loaded.predict_proba(new_data[['heart_rate', 'steps', 'sleep_hours']])[0].tolist()

    # Prepare the result
    result = {
        "rules_stress_level": new_data['stress_level_rules'][0],
        "predicted_stress": predicted_stress,
        "predicted_probability": predicted_probability
    }

    # Print the result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()