import React, { useState, useEffect } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { Container, Row, Col } from "react-bootstrap";
import { io } from "socket.io-client";
import "../css/Streaming.css";

const socket = io("http://localhost:9000");


const Streaming = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [userRequest, setUserRequest] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioSrc, setAudioSrc] = useState(null)

  useEffect(() => {
    handleListen();
  }, [isRecording]);

  const handleListen = async () => {
    if(isRecording){
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let audioChunks = [];
    
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };
    
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioURL = window.URL.createObjectURL(audioBlob)
                console.log(audioURL)
                setAudioSrc(audioURL)
            };
    
            recorder.start();
            setMediaRecorder(recorder);
        } catch (error) {
            console.error('Error accessing the microphone', error);
        }
    } else if (mediaRecorder) {
        mediaRecorder.stop()
    }
  };

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
          ></textarea>
        </Col>
        <Col>
          <h1>Response:</h1>
          <textarea className="aiResponse" disabled></textarea>
          <audio className="palyback" controls={true} src={audioSrc}></audio>
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
