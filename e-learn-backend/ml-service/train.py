import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

# Sample dataset
data = pd.DataFrame({
    "Question1": [1, 2, 3, 4],
    "Question2": [2, 3, 4, 1],
    "Question3": [3, 4, 1, 2],
    "LearningStyle": ["Visual", "Auditory", "Read/Write", "Kinaesthetic"]
})

X = data.drop("LearningStyle", axis=1)
y = data["LearningStyle"]

model = RandomForestClassifier()
model.fit(X, y)

pickle.dump(model, open("learning_style_model.pkl", "wb"))
