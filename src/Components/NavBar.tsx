import React from 'react';
import { Icon, Step } from 'semantic-ui-react';

interface Props extends React.ComponentPropsWithoutRef<any> {
	stepCompletion: {
		[key: number]: boolean
	},
}

interface Tab {
	index: number,
	title: string,
	icon: any,
	name: string
}

const tabs: Array<Tab> = [
	{
		index: 1,
		title: 'Choose and Upload File',
		icon: 'upload',
		name: 'upload'
	},
	{
		index: 2,
		title: 'Analyse and Generate Tests',
		icon: 'settings',
		name: 'test'
	},
	{
		index: 3,
		title: 'Review Changes and Download',
		icon: 'download',
		name: 'review'
	}
]

const NavBar: React.FC<Props> = ({ stepCompletion, ...additionalProps }) => {
	const { currentStep, goToStep, totalSteps } = additionalProps;

	const handleNavigation = (direction: string) => {
		if (direction === 'forward') {
			goToStep(currentStep + 1)
		} else {
			goToStep(currentStep - 1)
		}
	}

	return (
		<>
			<Step.Group widths={3}>
				{tabs.map(tab => (
					<Step
						active={currentStep === tab.index}
						onClick={() => goToStep(tab.index)}
						disabled={tab.index > 1 && !stepCompletion[tab.index - 1]}
					>
						<Icon name={tab.icon} />
						<Step.Content>
							<Step.Title>{tab.title}</Step.Title>
						</Step.Content>
					</Step>
				))}
			</Step.Group>
			<div className='nav-btns-container' style={currentStep === 1 ? { justifyContent: 'flex-end' } : {}}>
				{currentStep > 1 && (
					<div className='nav-btn' onClick={() => handleNavigation('backward')}>
						<Icon name='caret left' />
						Back
					</div>
				)}
				{(currentStep < totalSteps && stepCompletion[currentStep]) && (
					<div className='nav-btn' onClick={() => handleNavigation('forward')}>
						Next
						<Icon name='caret right' />
					</div>
				)}
			</div>
		</>
	)
}

export default NavBar