import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import StepWizard from 'react-step-wizard';
import fileDownload from 'js-file-download';

import NavBar from './Components/NavBar';
import Console from './Components/Console';
import UploadFile from './Components/UploadFile';
import Diff from './Components/DiffViewer';
import './App.css';

interface CodeData {
	fileName: string,
	testFilePath: string,
	currentCode: string,
	updatedCode: string
}

function App() {
	const [socket, setSocket] = useState<any>(null);
	const [projectName, setProjectName] = useState('');
	const [status, setStatus] = useState('');
	const [stepCompletion, setStepCompletion] = useState<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false });
	const [codeData, setCodeData] = useState<CodeData[]>([]);
	useEffect(() => {
		const socket = io('http://localhost:3000');
		setSocket(socket);

		socket.on('status-update', (data: { type: string, payload?: any }) => {
			switch (data.type) {
				case 'unzipping file':
					setStatus('Unzipping Uploaded File...\n')
					break;
				case 'generating-tests':
					setStatus('Generating Tests...\n')
					break;
				case 'validating-tests':
					setStatus('Validating Tests...\n')
					break;
				case 'test-validation-result':
					const { payload: { numberOfFailingTests } } = data;
					setStatus(`${numberOfFailingTests} Tests failed...\n`)
					break;
				case 'fixing-failed-tests':
					setStatus('Fixing Failed Tests...\n')
					break;
				case 'process-completed':
					const { payload: { currentOverallMetrics, updatedOverallCoverageMetrics, updatedCodeData } } = data;
					handleStepCompletion(2);
					// Calculate coverage percentage
					const prevCoveragePercentage = (currentOverallMetrics.coveredStatements / currentOverallMetrics.totalStatements) * 100;
					// Calculate updated coverage percentage
					const updatedCoveragePercentage = (updatedOverallCoverageMetrics.coveredStatements / updatedOverallCoverageMetrics.totalStatements) * 100;
					setCodeData(updatedCodeData);
					setStatus(`Process completed. Improved coverage from ${prevCoveragePercentage} to ${updatedCoveragePercentage}\n`);
					break;
				default:
					break;
			}
		})

		return () => {
			socket.disconnect();
		};
	}, []);

	const downloadUpdatedCode = async () => {
		try {
			const res = await axios({
				url: 'http://localhost:3000/download',
				method: 'POST',
				responseType: 'blob',
				data: {
					projectName
				}
			});

			fileDownload(res.data, `updated-${projectName}.zip`);
		} catch (error) {
			console.log(error);
		}
	}

	const handleStepCompletion = (step: number, moveToNext?: Function) => {
		setStepCompletion((prev: any) => ({ ...prev, [step]: true }));

		if (moveToNext) {
			moveToNext(step + 1);
		}
	};

	const resetStepCompletion = (step: number) => {
		setStepCompletion((prev: any) => ({ ...prev, [step]: false }));
	}

	return (
		<div className="App">
			<StepWizard
				initialStep={1}
				nav={
					<NavBar {...{ stepCompletion }} />}
			>
				<UploadFile {...{ handleStepCompletion, setProjectName }} />
				<Console
					socket={socket} status={status}
					stepCompletion={stepCompletion}
					resetStepCompletion={resetStepCompletion}
					projectName={projectName}
				/>
				<Diff codeData={codeData} download={downloadUpdatedCode} />
			</StepWizard>
		</div>
	);
}

export default App;
