import { FC, useState, useEffect, useRef } from "react";
import axios from 'axios';
import { CodeBlock, atomOneDark } from "react-code-blocks";
import { Button } from 'semantic-ui-react';

import "./style.css"

interface Props extends  React.ComponentPropsWithoutRef<any> { 
  socket: any, 
  status: string,
  stepCompletion: {
		[key: number]: boolean
	},
  resetStepCompletion: Function,
  projectName: string
}

const Console: FC<Props> = ({
  socket, status, stepCompletion, resetStepCompletion,
  projectName, ...additionalProps
}) => {

  const [text, setText] = useState('Initialising...\n');
  const codeBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket) {
      socket.on('test-output', (data: any) => {
        setText((prevOutput) => prevOutput + data);
        scrollToBottom();
      });

      socket.on('test-error', (data: any) => {
        setText((prevOutput) => prevOutput + data);
        scrollToBottom();
      });

      socket.on('error', (err: any) => {
        setText(err);
        scrollToBottom();
      });
    }
  }, [socket]);

  useEffect(() => {
    setText((prevOutput) => prevOutput + status);
  }, [status])

  const scrollToBottom = () => {
    const lastTokenElement = document.getElementsByTagName("code");
    lastTokenElement[0].lastElementChild?.scrollIntoView();
  };

  const rerunTest = async () => {
    resetStepCompletion(2);
    await axios.post('http://localhost:3000/rerun', { projectName });
  }


  return text ? (
    <div className="code-block-container" ref={codeBlockRef}>
      <div className="action-btns-container">
      <Button
        primary
        onClick={rerunTest}
        disabled={!stepCompletion[2]}
      >
        Re-run Tests
      </Button>
      <Button
        positive
        onClick={() => additionalProps.goToStep(3)}
        disabled={!stepCompletion[2]}
      >
        View Changes
      </Button>
      </div>
      <CodeBlock
        language="javascript"
        id="code-block"
        text={text}
        theme={atomOneDark}
        showLineNumbers={false}
        wrapLines
      />
    </div>
  ) : null;
}

export default Console;