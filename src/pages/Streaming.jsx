import React, { useState, useEffect, useRef } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { Container, Row, Col } from "react-bootstrap";
import { socket } from "../Socket.jsx";
import "../css/Streaming.css";

socket.on("connect", () => {
  console.log("connected");
});

const SpeechRecogniton =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecogniton();

mic.continuous = true;
mic.lang = "en-US";

const audioContext = new AudioContext();

const Streaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userRequest, setUserRequest] = useState("");
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [AIResponse, setAIResponse] = useState("");
  const [streamTime, setStreamTime] = useState(0);
  const streamTimeRef = useRef(0);
  const audioBufferQueue = useRef([]);
  const isProcessingAudioRef = useRef(null);
  const prevAudioTimeRef = useRef(0);

  useEffect(() => {
    handleListen();
  }, [isRecording]);

  useEffect(() => {
    socket.on("audio-buffer", (chunk) => {
      if (chunk) {
        audioBufferQueue.current.push(chunk);
        processAudioQueue();
      }
    });

    return () => {
      socket.off("audio-buffer");
    };
  }, []);

  const processAudioQueue = async () => {
    if (prevAudioTimeRef.current === 0) {
      setStreamTime((Date.now() - streamTimeRef.current) / 1000);
    }
    if (isProcessingAudioRef.current) {
      return;
    }
    isProcessingAudioRef.current = true;
    while (audioBufferQueue.current.length) {
      const chunk = audioBufferQueue.current.shift();
      if (chunk.done) {
        prevAudioTimeRef.current = 0;
      } else if (chunk.value) {
        try {
          const buffer = await audioContext.decodeAudioData(chunk.value);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);

          const currentTime = audioContext.currentTime;
          const startAt = Math.max(currentTime, prevAudioTimeRef.current);
          source.start(startAt);
          prevAudioTimeRef.current = startAt + buffer.duration;
        } catch (error) {
          console.error("Error decoding audio data:", error);
        }
      }
    }

    isProcessingAudioRef.current = false;
  };

  const handleListen = async () => {
    if (isRecording) {
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
      setUserRequest("");
      setAIResponse("");
      setStreamTime(0);
    };
    mic.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscriptionFailed(false);
      setUserRequest(transcript);
      if (!isRecording && socket.connected) {
        streamTimeRef.current = Date.now();
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
    setAIResponse(AIResponse + text);
  });

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
          <textarea
            className="aiResponse"
            value={AIResponse}
            disabled
          ></textarea>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Time til start:</h3>
          <h4>{streamTime} seconds</h4>
        </Col>
      </Row>
    </Container>
  );
};

export default Streaming;
