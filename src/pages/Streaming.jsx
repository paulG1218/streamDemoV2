import React, {useState} from 'react'
import { BsFillMicFill } from "react-icons/bs";
import "../css/Streaming.css"

const Streaming = () => {

    const [isRecording, setIsRecording] = useState(false)

  return (
    <div className='streamPage'>
        {isRecording ? 
        <>
        <h1>Recording...</h1>
        <button className='micButtonRecording' onClick={() => setIsRecording(false)}>
            <h1><BsFillMicFill/></h1>
        </button>
        </>
        :
        <>
        <h1>Record your request:</h1>
        <button className='micButton' onClick={() => setIsRecording(true)}>
            <h1><BsFillMicFill/></h1>
        </button>
        </>
        }
    </div>
  )
}

export default Streaming
