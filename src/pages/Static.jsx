import React, { useState, useEffect, useRef } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { Container, Row, Col } from "react-bootstrap";
import { IconContext } from "react-icons";
import axios from "axios";
import "../css/Streaming.css";

const SpeechRecogniton =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecogniton();

mic.continuous = true;
mic.lang = "en-US";

const Static = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userRequest, setUserRequest] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [staticTime, setStaticTime] = useState(0);
  const staticTimeRef = useRef(0);

  useEffect(() => {
    handleListen();
  }, [isRecording]);

  const handleListen = () => {
    if (isRecording) {
      mic.start();
      mic.onend = () => {
        console.log("continue..");
        mic.start;
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("static mic stopped");
      };
    }
    mic.onstart = () => {
      console.log("static mic on");
      setUserRequest("");
      setAiResponse("");
      setStaticTime(0);
    };
    mic.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscriptionFailed(false);
      setUserRequest(transcript);
      staticTimeRef.current = Date.now();
      const res = await axios.post("/api/static", { prompt: transcript });
      setAiResponse(res.data.message);
      const AIAudio = new Audio(res.data.audioPath);
      AIAudio.load();
      setStaticTime((Date.now() - staticTimeRef.current) / 1000);
      AIAudio.play();
      AIAudio.onended = async () => {
        await axios.post("/api/cleanup", { filePath: res.data.audioPath });
      };
    };
    mic.onerror = (event) => {
      console.log(event);
      setTranscriptionFailed(true);
      setUserRequest("Try again");
    };
  };

  return (
    <Container>
      <Row>
        <Col xs={{ span: 6, offset: 3 }}>
          <h1 className="pageHeader">
            AI Q&A <span className="without">without</span> data streaming:
          </h1>
        </Col>
      </Row>
      <Row>
        <Col>
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
          <textarea
            className="aiResponse"
            disabled
            value={aiResponse}
          ></textarea>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Time til start:</h3>
          <h4>{staticTime} seconds</h4>
        </Col>
      </Row>
    </Container>
  );
};

export default Static;
