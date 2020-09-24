import React from 'react';
import {
	BrowserRouter as Router,
	Route,
} from "react-router-dom";
import TetrisIndex from './TetrisIndex';

//Using react-router-dom to get the hash based url, And then it redirects the browser page
//to the tetris index with the url as a path property
const App = () => {

	return (
		<Router>
			<Route path="/:room?" component={TetrisIndex} />
		</Router>
	)
};

export default App;
