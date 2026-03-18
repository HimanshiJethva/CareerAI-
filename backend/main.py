# from fastapi import FastAPI
# import joblib
# import pandas as pd
# from pydantic import BaseModel

# app = FastAPI()

# # Sahi path ka use karna zaroori hai
# MODEL_PATH = "models/career_model.joblib" 

# @app.on_event("startup")
# def load_model():
#     # Model ko server start hote hi load karna (Week 5 Task)
#     global model
#     model = joblib.load(MODEL_PATH)
#     print("Model Successfully Loaded from backend/models/ folder!")

# # 3. Input Data ka structure (Pydantic Model)
# # Yahan wahi features likhein jo aapke dataset mein hain
# class StudentData(BaseModel):
#     Oppenness: float
#     Mathematics: float
#     ComputerScience: float
#     Biology: float
#     # ... baki 36 features yahan add karein [cite: 19, 21]

# @app.get("/")
# def home():
#     return {"message": "Career Prediction API is LIVE!"}

# # 4. Prediction Endpoint [cite: 64, 65]
# # @app.post("/predict")
# # def predict_career(data: StudentData):
# #     # Input data ko DataFrame mein badlein
# #     input_df = pd.DataFrame([data.dict()])
    
# #     # Model se prediction lein 
# #     prediction = model.predict(input_df)
    
# #     return {"suggested_career": int(prediction[0])}
# career_map = {
#     0: "Artist",
#     1: "Athlete",
#     2: "Chartered Accountant",
#     3: "Doctor",
#     4: "Engineer",
#     5: "Entrepreneur",
#     6: "Politician",
#     7: "Scientist",
#     8: "Software Developer",
#     9: "Teacher"
# } 
# FEATURE_NAMES = [
#     'Stream','Physics','Chemistry','Biology','English','ComputerScience','Mathematics',
#     'Accountancy','BusinessStudies','Economics','History','Geography','PoliticalScience',
#     'Sociology','Interest_Tech','Interest_Entrepreneurship','Interest_Leadership',
#     'Interest_Innovation','Interest_CriticalThinking','Interest_Research',
#     'Interest_ComputerSkill','Interest_HardwareSkill','Interest_Food','Interest_Creativity',
#     'PositiveThinking','Participated_Hackathon','Participated_Olympiad','Participated_Kabaddi',
#     'Participated_KhoKho','Participated_Cricket','CareerOption','Oppenness',
#     'Conscientiousness','Extraversion','Agreeableness','Neuroticism'

# ]
# # @app.post("/predict")
# # def predict_career(data: dict):
# #     # ... aapka purana logic ...
# #     prediction_id = int(model.predict(full_data)[0])
# #     career_name = career_map.get(prediction_id, "Career Option")
    
# #     return {
# #         "career_id": prediction_id,
# #         "suggested_career": career_name
# #     }
# # @app.post("/predict")
# # def predict_career(data: dict): # 'dict' use karein taaki flexible data le sakein
# #     try:
# #         # 1. Ek blank DataFrame banayein jisme saare 36 features ho (sab 0 ke saath)
# #         # Maan lijiye 'all_features' aapki un 36 columns ki list hai
# #         all_features = model.feature_names_in_ # Ye model se columns nikal lega
# #         full_data = pd.DataFrame(0, index=[0], columns=all_features)
        
# #         # 2. Jo data user ne bheja hai, use full_data mein fill karein
# #         for key, value in data.items():
# #             if key in full_data.columns:
# #                 full_data[key] = value
        
# #         # 3. Prediction karein
# #         prediction = model.predict(full_data)
# #         return {"suggested_career": int(prediction[0])}
        
# #     except Exception as e:
# #         return {"error": str(e)}
# @app.post("/predict")
# def predict_career(data: dict):
#     try:
#         # Step A: Khali DataFrame banayein (full_data)
#         # Ismein 36 columns hain aur sabki value 0 hai
#         full_data = pd.DataFrame(0, index=[0], columns=FEATURE_NAMES)

#         # Step B: User ke data ko 'full_data' mein bharna
#         for key, value in data.items():
#             if key in full_data.columns:
#                 full_data[key] = value
        
#         # Step C: Model Prediction
#         prediction_id = int(model.predict(full_data)[0])
#         career_name = career_map.get(prediction_id, "Career Not Found")

#         return {
#             "status": "success",
#             "prediction_id": prediction_id,
#             "career_name": career_name
#         }

#     except Exception as e:
#         return {"status": "error", "message": str(e)}
from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# Load Model & Encoders (from model folder)
model = joblib.load("models/career_model.joblib")
stream_encoder = joblib.load("models/stream_encoder.joblib")
career_encoder = joblib.load("models/career_encoder.joblib")

@app.get("/")
def home():
    return {"message": "Career Prediction API Running"}

# @app.post("/predict")
# def predict(data: dict):

#     # Convert input to DataFrame
#     df = pd.DataFrame([data])

#     # Encode Stream
#     df["Stream"] = stream_encoder.transform(df["Stream"])

#     # Ensure correct column order
#     df = df[model.feature_names_in_]


#     # Prediction
#     prediction = model.predict(df)

#     # Decode Career
#     career = career_encoder.inverse_transform(prediction)

#     return {"Predicted Career": career[0]}
# @app.post("/predict")
# def predict(data: dict):

#     try:
#         df = pd.DataFrame([data])

#         print("Received Data:")
#         print(df)

#         df["Stream"] = stream_encoder.transform(df["Stream"])

#         df = df[model.feature_names_in_]

#         prediction = model.predict(df)

#         career = career_encoder.inverse_transform(prediction)

#         return {"Predicted Career": career[0]}

#     except Exception as e:
#         return {"error": str(e)}
@app.post("/predict")
def predict(data: dict):

    df = pd.DataFrame([data])

    # Encode Stream
    df["Stream"] = stream_encoder.transform(df["Stream"])

    # Ensure correct column order
    df = df[model.feature_names_in_]

    # Prediction
    prediction = model.predict(df)
    probability = model.predict_proba(df)

    # Decode career name
    career = career_encoder.inverse_transform(prediction)

    return {
        "Predicted Career": career[0],
        "Confidence": float(max(probability[0]))
    }