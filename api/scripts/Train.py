import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load the synthetic dataset with stress levels
data = pd.read_csv('stressdata.csv')

# Define features and target
features = ['heart_rate', 'steps', 'sleep_hours']
target = 'stress_level'

X = data[features]
y = data[target]

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Decision Tree Classifier
dt_model = DecisionTreeClassifier(random_state=42)

# Train the model
dt_model.fit(X_train, y_train)

# Save the trained model
joblib_file = "pretrained_dt_model_stress.pkl"
joblib.dump(dt_model, joblib_file)

print(f"Model saved as {joblib_file}")

# Evaluate the model
y_pred = dt_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

print(f'Accuracy: {accuracy}')
print('Classification Report:')
print(report)
