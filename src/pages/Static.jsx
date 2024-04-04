import React, { useState } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { Container, Row, Col } from "react-bootstrap";
import { IconContext } from "react-icons";
import { io } from "socket.io-client";
import "../css/Streaming.css";

const socket = io("http://localhost:9000")

const Static = () => {

    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null);

    socket.on("connect", () => {
        console.log(socket.id); // 
      });

    const handleStartRecord = async (e) => {

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = { mimeType: 'audio/webm' };
            const recorder = new MediaRecorder(stream, options);
            let audioChunks = [];
    
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };
    
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                // Convert the Blob to an ArrayBuffer before sending
                audioBlob.arrayBuffer().then(arrayBuffer => {
                    // Ensure you have a condition to check socket connection or adapt as needed
                    if (socket.connected) {
                        socket.emit('audio_data', arrayBuffer);
                    }
                });
            };
    
            recorder.start();
            // Store the recorder somewhere for later use, e.g., to stop the recording
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing the microphone', error);
        }
    };
    
    // Ensure you have a way to stop the recording, which triggers `onstop`
    // For example, `mediaRecorder.stop()` when the user clicks a "stop recording" button.

    const handleStopRecord = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop(); // This triggers the `onstop` event in your `handleStartRecord`
            setIsRecording(false); // Assuming you use this to update the UI or state
        }
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
          {isRecording ? (
            <>
              <h1>Recording...</h1>
              <button
                className="micButtonRecording"
                onClick={() => handleStopRecord()}
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
          ) : (
            <>
              <h1>Record your request:</h1>
              <button
                className="micButton"
                onClick={() => handleStartRecord()}
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
          )}
          <h2>Your request:</h2>
          <textarea className="requestText" disabled></textarea>
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
