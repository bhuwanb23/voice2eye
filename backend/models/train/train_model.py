import pandas as pd
import numpy as np
import tensorflow as tf
import json
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv("dataset.csv", header=None)
X = df.iloc[:, 1:].values.astype(np.float32)   # 63 features
labels_raw = df.iloc[:, 0]
label_categories = pd.Categorical(labels_raw)
y = label_categories.codes.astype(np.int32)
label_names = list(label_categories.categories)

print(f"Labels: {label_names}")
print(f"Samples: {len(X)}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

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
model.fit(X_train, y_train, epochs=50, validation_data=(X_test, y_test))

# Export to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

os.makedirs("../assets/model", exist_ok=True)
with open("../assets/model/custom_gestures.tflite", "wb") as f:
    f.write(tflite_model)

with open("../assets/model/labels.json", "w") as f:
    json.dump(label_names, f)

print("\n✅ Done! Files written to assets/model/")
print("   - custom_gestures.tflite")
print("   - labels.json")