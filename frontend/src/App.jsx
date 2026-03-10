import { useState } from "react";
import axios from "axios";


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        setError(response.data.error);
        setResult(null);
      } else {
        console.log(response.data);
        setResult(response.data);
        setFileId(response.data.file_id);
      }
    } catch {
      setError("Upload failed. Make sure the backend is running.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fileId) {
      setError("Please upload a CSV first.");
      return;
    }
  
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
  
    try {
      setError("");
  
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        file_id: fileId,
        question: question,
      });
  
      setAnalysisResult(response.data);
      console.log("Analysis response:", response.data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Analysis failed.");
      setAnalysisResult(null);
    }
  };


  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>AI Data Analyst Dashboard - Demo</h1>
      <p>Upload a CSV file to preview your data.</p>

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "1rem" }}>
        Upload CSV
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>File Summary</h2>
          <p><strong>File Name:</strong> {result.file_name}</p>
          <p><strong>Row Count:</strong> {result.row_count}</p>
          <p><strong>Columns:</strong> {result.columns.join(", ")}</p>

          <h3>Preview</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {result.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.preview.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {result.columns.map((column) => (
                    <td key={column}>{String(row[column] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        <div style={{ marginTop: "2rem" }}>
          <h2>Ask a Question</h2>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What is the average salary?"
            style={{ width: "300px", marginRight: "1rem" }}
          />

          <button onClick={handleAnalyze}>Analyze</button>
        </div>

        {analysisResult && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Analysis Result</h3>
            <p>{analysisResult.answer}</p>
          </div>
        )}
    </div>
  );
}

export default App;