import styled from 'styled-components';

export const StyledDisplay = styled.button`
	border-radius: 3px;
	background: #white;
	border: none;
	margin: 0 0 20px 0;
	padding: 10px;
	width: 100%;
	color: ${(props) => (props.gameOver ? 'red' : '#888')};
`;
StyledDisplay['propsToTest'] = [{ gameOver: true }, { gameOver: false }];
