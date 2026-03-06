from io import StringIO

import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests during local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    return {
        "file_name": file.filename,
        "columns": df.columns.tolist(),
        "row_count": len(df),
        "preview": preview_df.to_dict(orient="records"),
    }