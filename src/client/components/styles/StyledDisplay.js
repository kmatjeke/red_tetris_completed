import styled from 'styled-components';

export const StyledDisplay = styled.button`
	// box-sizing: border-box;
	// display: flex;
	// align-items: center;
	// min-height: 30px;
	// font-family: Pixel, Arial, Helvetica, sans-serif;
	// font-size: 0.8rem;
	border-radius: 3px;
	background: #333;
	border: none;
	margin: 0 0 20px 0;
	padding: 10px;
	width: 100%;
	color: ${(props) => (props.gameOver ? 'red' : '#888')};
`;
StyledDisplay['propsToTest'] = [{ gameOver: true }, { gameOver: false }];
