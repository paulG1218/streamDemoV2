import React, { useState } from "react";
import { BsFillMicFill } from "react-icons/bs";
import { Container, Row, Col } from "react-bootstrap";
import { IconContext } from "react-icons";
import "../css/Streaming.css";

const Static = () => {
  const [isRecording, setIsRecording] = useState(false);

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
        </Col>
        <Col>
          <h1>Response:</h1>
          <textarea className="aiResponse"></textarea>
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
