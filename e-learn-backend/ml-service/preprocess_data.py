import pandas as pd

# Load the original dataset
data_path = "data/recommendation_data.csv"  # Ensure correct dataset path
df = pd.read_csv(data_path)

# Ensure required columns exist
required_columns = ['UserID', 'CourseID', 'Rating', 'Subject', 'Format', 'Difficulty']
df = df[required_columns]  # Keep only necessary columns

# ✅ Fix duplicates: Aggregate ratings for same (UserID, CourseID)
df_cleaned = df.groupby(['UserID', 'CourseID'], as_index=False).agg({
    'Rating': 'mean',   # Take the average rating if multiple exist
    'Subject': 'first', # Keep first subject (modify if needed)
    'Format': 'first',  # Keep first format
    'Difficulty': 'first' # Keep first difficulty level
})

# Save cleaned dataset
df_cleaned.to_csv("data/recommendation_data_cleaned.csv", index=False)
print("✅ Cleaning complete! Duplicate entries resolved, and new dataset saved.")
