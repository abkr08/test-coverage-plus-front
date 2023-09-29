import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faFile } from '@fortawesome/free-solid-svg-icons';
import { Form, Button, Progress } from 'semantic-ui-react';
import axios from 'axios';

interface Props extends React.ComponentPropsWithoutRef<any> {
	handleStepCompletion: Function,
	setProjectName: Function
}


const UploadFile: React.FC<Props> = ({ handleStepCompletion, setProjectName, ...additionalProps }) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [showGitHubUpload] = useState<boolean>(false);

	/*
	* An event handler for the project file selection
	* @returns {void}
	*/
	const onFileSelected = () => {
		// Check if the inputRef.current is not null
		if (inputRef.current && inputRef.current.files) {
			const selectedFile = inputRef.current.files[0];
			setFile(selectedFile);

			const projectName = selectedFile.name.substring(0, selectedFile.name.length - 4);
			setProjectName(projectName);
		}
	}

	/*
	* A function that uploads the project to the backend
	* @param {FormData} data - The project that's being uploaded
	* @returns {void}
	*/
	const upload = async (data: FormData) => {
		try {
			// Create an instance of axios with progress bar support
			const instance = axios.create();
			// ProgressBar.register(instance);

			// Make a POST request to the backend endpoint for file upload
			await instance.post('http://localhost:3000/upload', data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: (progressEvent) => {
					// Calculate the progress percentage
					const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setUploadProgress(progress);

					if (progress === 100) {
						setTimeout(() => {
							setUploadProgress(0);
						}, 2000);

						handleStepCompletion(1, additionalProps.goToStep);
					}
				},
			});
		} catch (error) {
			// Handle any errors that occur during the upload process
			console.error('File upload error:', error);
		}
	}

	const uploadFile = async () => {
		// const { updateProfile } = this.props;
		if (file !== null) {
			let formData = new FormData();
			formData.append('file', file);
			await upload(formData);
		}
	}
	// create a function that renders file size in kb, mb and gb
	const formatBytes = (bytes: number, decimals = 2) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	const chooseFileHandler = () => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	}

	const cancelFileSelection = () => {
		inputRef.current!.value = '';
		setFile(null);
	}

	return (
		<div className='upload-file-container'>
			<div className='dropzone' onClick={e => { e.stopPropagation(); chooseFileHandler() }}>
				{file ? (
					<span>
						<FontAwesomeIcon icon={faFile} stroke='#1E3050' strokeWidth={10} fill='none' size="3x" />
						<p>{file.name}</p>
						<p>{formatBytes(file.size)}</p>
					</span>
				) : (
					<span>
						<FontAwesomeIcon icon={faCloudArrowUp} stroke='#1E3050' strokeWidth={10} fill='none' size="3x" />
					</span>
				)}
				<input
					type="file"
					ref={inputRef}
					onChange={onFileSelected}
					accept=".zip,.tar,.gz"
					style={{ visibility: 'hidden', height: '0px' }}
				/>
				{!file && (
					<>
						<p>Drag and Drop or Choose file to upload</p>
						<p>ZIP or TAR</p>
					</>
				)}
			</div>
			{uploadProgress !== 0 && <Progress percent={uploadProgress} indicating />}
			{showGitHubUpload && (
				<>
					<span className='or-text'>OR</span>
					<Form>
						<Form.Field>
							<label>Import from GitHub</label>
							<input placeholder='Add GitHub URL' name='githubURL' id='githubURL' />
						</Form.Field>
					</Form>
				</>
			)}

			<div className='buttons-container'>
				<Button
					secondary
					onClick={() => cancelFileSelection()}
					disabled={!file}
				>
					Cancel
				</Button>
				<Button
					primary
					disabled={!file}
					onClick={uploadFile}
				>
					Upload
				</Button>
			</div>

		</div>
	)
}

export default UploadFile;

