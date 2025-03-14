//Đã tạo 1 db trên firebase, sau mỗi câu trl sẽ lưu vào trong đó
//History được lấy từ firebase
import React, { useState, useEffect } from "react";
import "./style.css";
import sendIcon from "../../assets/send_icon.png";

interface Message {
  question: string;
  answer: string;
  createdAt: string;
}

const USERNAME = "huy0403";
const API_KEY = "aio_qVRB87ZJJ5e47Cwu5w0Wf2Boin6B";

const PromptPage: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hasAnswer, setHasAnswer] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(window.innerWidth > 768);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-prompt`, {
        headers: { "X-AIO-Key": API_KEY }
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data: Message[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessageHistory(sorted);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleResize = () => {
      setShowHistory(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    setHasAnswer(false);
    const currentDate = new Date().toISOString();
    try {
      const res = await fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/iot-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-AIO-Key": API_KEY },
        body: JSON.stringify({ question, createdAt: currentDate }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      const fetchedAnswer = data.last_value;
      setAnswer(fetchedAnswer);
      setHasAnswer(true);
      setMessageHistory((prev) => [{ question, answer: fetchedAnswer, createdAt: currentDate }, ...prev]);
    } catch (error) {
      console.error("Error sending question:", error);
      setAnswer("An error occurred. Please try again later.");
      setHasAnswer(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="prompt-container">
      <button className="toggle-history-button" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Hide History" : "Show History"}
      </button>
      {showHistory && (
        <nav className="prompt-navbar">
          <h3>Message History</h3>
          <ul>
            {messageHistory.map((msg, index) => (
              <li key={index}>
                <strong>{new Date(msg.createdAt).toLocaleDateString()}:</strong>
                <p className="question-text">{msg.question}</p>
                <p className="answer-text">{msg.answer}</p>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="prompt-left-content">
        {!hasAnswer && (
          <h2 className="prompt-main-title">
            Please enter your question regarding<br />
            the condition of your plant
          </h2>
        )}
        <div className="prompt-bubble">
          <div className="prompt-bubble-input-row">
            <textarea
              placeholder="Example: Is my plant showing signs of disease?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            <button className="prompt-send-button" onClick={handleSend} disabled={isLoading}>
              {isLoading ? (
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              ) : (
                <img src={sendIcon} alt="Send" />
              )}
            </button>
          </div>
        </div>
        {hasAnswer && (
          <div className="prompt-bubble-answer">
            <div className="answer-header">
              <span className="status-indicator"></span>
              <h3>Analysis Result</h3>
            </div>
            <p className="answer-content">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
