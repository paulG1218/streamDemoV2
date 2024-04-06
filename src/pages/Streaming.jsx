import React, { useState } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { Container, Row, Col } from "react-bootstrap";
import "../css/Streaming.css";

const Streaming = () => {

  const [isRecording, setIsRecording] = useState(false);

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
          {isRecording ? (
            <>
              <h1>Recording...</h1>
              <button
                className="micButtonRecording"
                onClick={() => setIsRecording(false)}
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
                onClick={() => setIsRecording(true)}
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

export default Streaming;
