import pandas as pd 
import numpy as np 
import tensorflow as tf 
import json 
import os 
from sklearn.model_selection import train_test_split 
 
# Load dataset 
if not os.path.exists("dataset.csv"):
    print("Error: dataset.csv not found. Please run collect_landmarks.py first.")
    exit()

df = pd.read_csv("dataset.csv", header=None) 
X = df.iloc[:, 1:].values.astype(np.float32) 
labels_raw = df.iloc[:, 0] 
label_categories = pd.Categorical(labels_raw) 
y = label_categories.codes.astype(np.int32) 
label_names = list(label_categories.categories) 
 
print(f"Labels found: {label_names}") 
print(f"Total samples: {len(X)}") 
 
X_train, X_test, y_train, y_test = train_test_split( 
    X, y, test_size=0.2, random_state=42 
) 
 
# Build model 
model = tf.keras.Sequential([ 
    tf.keras.layers.Dense(128, activation="relu", input_shape=(63,)), 
    tf.keras.layers.Dropout(0.3), 
    tf.keras.layers.Dense(64, activation="relu"), 
    tf.keras.layers.Dropout(0.2), 
    tf.keras.layers.Dense(len(label_names), activation="softmax"), 
]) 
 
model.compile( 
    optimizer="adam", 
    loss="sparse_categorical_crossentropy", 
    metrics=["accuracy"] 
) 
 
model.fit( 
    X_train, y_train, 
    epochs=50, 
    validation_data=(X_test, y_test) 
) 
 
# Define output directory (relative to this script's location) 
output_dir = os.path.join("..", "assets", "model") 
os.makedirs(output_dir, exist_ok=True) 
 
# Export to TFLite 
converter = tf.lite.TFLiteConverter.from_keras_model(model) 
converter.optimizations = [tf.lite.Optimize.DEFAULT] 
tflite_model = converter.convert() 
 
tflite_path = os.path.join(output_dir, "custom_gestures.tflite") 
labels_path = os.path.join(output_dir, "labels.json") 
 
with open(tflite_path, "wb") as f: 
    f.write(tflite_model) 
 
with open(labels_path, "w") as f: 
    json.dump(label_names, f) 
 
print(f"\nDone! Model saved to: {tflite_path}") 
print(f"Labels saved to: {labels_path}") 
