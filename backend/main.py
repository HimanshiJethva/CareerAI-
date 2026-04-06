from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import joblib
import pandas as pd
import shap
import numpy as np
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ya phir ["http://localhost:3000"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Model & Encoders (from model folder)
model = joblib.load("models/career_model.joblib")
stream_encoder = joblib.load("models/stream_encoder.joblib")
career_encoder = joblib.load("models/career_encoder.joblib")

@app.get("/")
def home():
    return {"message": "Career Prediction API Running"}

#1. Explainer ko initialize karein (Ye model ka dimaag read karega)
explainer = shap.TreeExplainer(model)

@app.post("/predict")
def predict(data: dict):
    # 1. User input ko DataFrame mein convert karna
    df = pd.DataFrame([data])
    
    # 2. Encoding (Text data ko numbers mein badalna)
    # Maan lijiye 'Stream' column hai
    if "Stream" in df.columns:
        df["Stream"] = stream_encoder.transform(df["Stream"])
    
    # 3. Feature names ka order sahi karna
    df = df[model.feature_names_in_]
    
    # 4. Probabilities nikalna (Har career ka percentage score)
    all_probs = model.predict_proba(df)[0]
    career_names = career_encoder.classes_
    top_3_indices = all_probs.argsort()[-3:][::-1]

   # 2. SHAP Values nikalna (Pure row ke liye)
    shap_values = explainer.shap_values(df)
    
    predictions = []
    for i in top_3_indices:
        current_career = career_names[i]
        # i = Career ka index
        
        # Multi-class Random Forest ke liye SHAP array handle karna
        if isinstance(shap_values, list):
            career_contribution = shap_values[i][0] 
        else:
            career_contribution = shap_values[0][:, i]

        # --- NEW LOGIC: Sirf Positive Features pick karna ---
        # Hum check kar rahe hain ki user ka input 0 toh nahi hai 
        # Aur feature ka contribution positive (>0) hona chahiye
        user_vals = df.iloc[0].values
        
        # Ek aisi list banate hain jahan sirf wahi features hon jo user ke paas hain
        # aur jo career ke score ko badha rahe hain
        valid_contributions = []
        for val, weight in zip(user_vals, career_contribution):
            if val > 0 and weight > 0:
                valid_contributions.append(weight)
            else:
                valid_contributions.append(0)

        # Sabse bada valid contributor dhoondna
        top_feature_idx = np.argmax(valid_contributions)
        
        # Agar koi bhi positive match nahi mila (sab 0 hain), toh global best le lo
        if valid_contributions[top_feature_idx] == 0:
            top_feature_idx = career_contribution.argmax()

        top_feature_name = model.feature_names_in_[top_feature_idx]
        
        # Readable name (e.g., 'Interest_Tech' -> 'Tech')
        display_name = top_feature_name.replace("Interest_", "").replace("Participated_", "").replace("_", " ")
        
        career_messages = {
            "Doctor": f"Your strong performance in {display_name} reflects the analytical precision and dedication essential for a successful medical career.",
            "Software Developer": f"Your proficiency in {display_name} is a key indicator of the logical reasoning required to solve complex architectural challenges in tech.",
            "Politician": f"Your {display_name} traits highlight a natural ability for strategic influence and community leadership.",
            "Athlete": f"The discipline shown in your {display_name} score aligns perfectly with the high-performance standards of professional sports.",
            "Teacher": f"Your {display_name} skills demonstrate the effective communication and knowledge-sharing abilities needed to be an inspiring educator.",
            "Artist": f"Your unique perspective in {display_name} suggests a high level of creative intelligence, ideal for a thriving career in the arts.",
            "Entrepreneur": f"Your {display_name} approach showcases the innovative mindset and risk-assessment skills vital for building successful startups.",
            "Scientist": f"Your aptitude for {display_name} indicates a strong scientific temper and the curiosity required for advanced research and discovery.",
            "Engineer": f"Your excellence in {display_name} demonstrates the technical problem-solving mindset and structural logic required for a successful engineering career.",
            "Chartered Accountant": f"Your excellence in {display_name} demonstrates the numerical accuracy and financial expertise required for professional accounting."
        }

        # 2. Agar career list mein nahi hai toh ek generic but smart message
        default_message = f"Model ne paya hai ki aapka {display_name} aspect is career path mein safalta dilane ke liye sabse influential hai."
        
        selected_reason = career_messages.get(current_career, default_message)

        predictions.append({
            "career": career_names[i],
            "confidence": round(float(all_probs[i] * 100), 2),
            "reason": selected_reason#f"Aapki '{display_name}' quality is career match ke liye sabse mahatvapurn (influential) rahi hai."
        })

    return {
        "Top_Predictions": predictions,
        "Profile_Type": "All-rounder" if predictions[0]['confidence'] < 60 else "Focused",
        "Method": "SHAP Local Explanation"
    }
