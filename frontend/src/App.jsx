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

      console.log("Sending analyze request:", {
        file_id: fileId,
        question: question,
      });
  
      const response = await axios.post("http://127.0.0.1:8000/analyze", {
        file_id: fileId,
        question: question,
      });

      console.log("Analysis response:", response.data);
  
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

      <div style={{ marginBottom: "2rem" }}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "1rem" }}>
          Upload CSV
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
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

      <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
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

      {analysisResult?.row && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Matching Row</h4>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(analysisResult.row).map(([key, value]) => (
                <tr key={key}>
                  <td><strong>{key}</strong></td>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {analysisResult?.table && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Grouped Results</h4>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {Object.keys(analysisResult.table[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysisResult.table.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;