import React, { useState, useEffect } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { Container, Row, Col } from "react-bootstrap";
import { socket } from "../Socket.jsx";
import "../css/Streaming.css";

socket.on("connect", () => {
  console.log("connected")
})

const SpeechRecogniton =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecogniton();

mic.continuous = true
mic.lang = "en-US";

const Streaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userRequest, setUserRequest] = useState("");
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [AIResponse, setAIResponse] = useState('')

  useEffect(() => {
    handleListen();
  }, [isRecording]);

  const handleListen = async () => {
    if (isRecording) {
        setAIResponse("")
      mic.start();
      mic.onend = () => {
        console.log("continue..");
        mic.start;
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("stream mic stopped");
      };
    }
    mic.onstart = () => {
      console.log("stream mic on");
      setUserRequest("")
    };
    mic.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscriptionFailed(false);
      setUserRequest(transcript);
      if (socket.connected) {
        socket.emit("prompt", transcript);
      }
    };
    mic.onerror = (event) => {
      console.log(event);
      setTranscriptionFailed(true);
      setUserRequest("Try again");
    };
  };

  
  socket.on("text-delta", async (text) => {
      setAIResponse(AIResponse + text)
    })

    // socket.once("audio-buffer", (data) => {
    //   console.log("new data")
    //   console.log(data)
    // })

  return (
    <Container>
      <Row>
        <Col xs={{ span: 6, offset: 3 }}>
          <h1 className="pageHeader">
            AI Q&A <span className="with">with</span> data streaming:
          </h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <>
            <h1>{isRecording ? "Recording..." : "Record your request:"}</h1>
            <button
              className={isRecording ? "micButtonRecording" : "micButton"}
              onClick={() => setIsRecording((prevState) => !prevState)}
            >
              <IconContext.Provider
                value={{ size: "4em", className: "global-class-name" }}
              >
                <div>
                  <BsFillMicFill />
                </div>
              </IconContext.Provider>
            </button>
          </>
          <h2>Your request:</h2>
          <textarea
            className="requestText"
            disabled
            value={userRequest}
            style={transcriptionFailed ? { color: "red" } : { color: "black" }}
          ></textarea>
        </Col>
        <Col>
          <h1>Response:</h1>
          <textarea className="aiResponse" value={AIResponse} disabled></textarea>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Total response time:</h3>
        </Col>
      </Row>
    </Container>
  );
};

export default Streaming;
