from io import StringIO

import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Global dataframe storage
dataframes = {}

# Allow frontend requests during local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    file_id: str
    question: str

@app.post("/analyze")
def analyze_data(request: AnalyzeRequest):
    df = dataframes.get(request.file_id)

    if df is None:
        return {"answer": "Dataset not found."}

    numeric_columns = df.select_dtypes(include="number").columns.tolist()

    if not numeric_columns:
        return {"answer": "No numeric columns available for analysis."}

    question_lower = request.question.lower()

    print("User question:", request.question)
    print("All columns:", df.columns.tolist())
    print("Numeric columns:", numeric_columns)
    

    column = None
    normalized_question = question_lower.replace("_", " ").strip()

    for col in numeric_columns:
        normalized_col = col.lower().replace("_", " ").strip()
        if normalized_col in normalized_question:
            column = col
            break

    if column is None:
        column = numeric_columns[0]

    print("Matched column:", column)


    if "highest" in question_lower or "max" in question_lower:
        max_index = df[column].idxmax()
        max_row = df.loc[max_index]
        max_value = max_row[column]

        return {
            "answer": f"The highest value in {column} is {round(max_value, 2)}.",
            "row": max_row.fillna("").to_dict()
        }

    if "lowest" in question_lower or "min" in question_lower:
        min_index = df[column].idxmin()
        min_row = df.loc[min_index]
        min_value = min_row[column]

        return {
            "answer": f"The lowest value in {column} is {round(min_value, 2)}.",
            "row": min_row.fillna("").to_dict()
        }

    average_value = df[column].mean()
    return {
        "answer": f"The average value of {column} is {round(average_value, 2)}."
    }


@app.get("/")
def read_root():
    return {"message": "AI Data Analyst backend is running"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    # Basic file type check
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are allowed"}

    # Read uploaded file contents
    contents = await file.read()
    csv_text = contents.decode("utf-8")

    # Load into pandas DataFrame
    df = pd.read_csv(StringIO(csv_text))

    # Clean NaN values for JSON response
    preview_df = df.head(5).fillna("")

    import uuid

    file_id = str(uuid.uuid4())

    dataframes[file_id] = df

    return {
        "file_id": file_id,
        "file_name": file.filename,
        "columns": df.columns.tolist(),
        "row_count": len(df),
        "preview": preview_df.to_dict(orient="records"),
    }