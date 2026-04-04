import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Load data
df = pd.read_csv("car data.csv")

# Encode categorical
le = LabelEncoder()
df['Fuel_Type'] = le.fit_transform(df['Fuel_Type'])
df['Seller_Type'] = le.fit_transform(df['Seller_Type'])
df['Transmission'] = le.fit_transform(df['Transmission'])

# Features & target
X = df.drop(['Selling_Price', 'Car_Name'], axis=1)
y = df['Selling_Price']

# Train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestRegressor()
model.fit(X_train, y_train)

# Save
joblib.dump(model, "price_model.pkl")

print("✅ Price model trained & saved")