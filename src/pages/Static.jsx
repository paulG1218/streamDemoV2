import React, { useState, useEffect } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { Container, Row, Col } from "react-bootstrap";
import { IconContext } from "react-icons";
import { io } from "socket.io-client";
import axios from "axios";
import "../css/Streaming.css";

// const socket = io("http://localhost:9000");

const SpeechRecogniton = window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecogniton()

mic.continuous = true
mic.lang = "en-US"
const Static = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userRequest, setUserRequest] = useState('');

  useEffect(() => {
    handleListen()
  }, [isRecording])
//   const [mediaRecorder, setMediaRecorder] = useState(null);

//   socket.on("connect", () => {
//     console.log(socket.id); //
//   });

const handleListen = () => {
    if (isRecording) {
        mic.start()
        mic.onend = () => {
            console.log("continue..")
            mic.start
        }
    } else {
        mic.stop()
        mic.onend = () => {
            console.log("stopped")
        }
    }
    mic.onstart = () => {
        console.log("mic on")
    }
    mic.onresult = event => {
        const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
        setUserRequest(transcript)
        console.log(userRequest)
    }
    mic.onerror = event => {
        console.log(event)
        setUserRequest("Try again")
    }
}

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
            <>
              <h1>{isRecording ? 'Recording...' : 'Record your request:'}</h1>
              <button
                className={isRecording ? "micButtonRecording" : "micButton"}
                onClick={() => setIsRecording(prevState => !prevState)}
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
          <textarea className="requestText" disabled value={userRequest}></textarea>
        </Col>
        <Col>
          <h1>Response:</h1>
          <textarea className="aiResponse" disabled></textarea>
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

export default Static;
