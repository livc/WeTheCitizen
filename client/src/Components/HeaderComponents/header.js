import React, { Component } from 'react';

import './header.css'

import logo from './logo.svg';
import logo2 from '../../img/logo.svg'

class Header extends Component {
	render() {
		return (
			<div className="header-class">
				
				
				<header className="App-header">
					<div className="small-header">
						<img src={logo} width="100px" height="100px"/>
						<h1 className="App-title">WetheCitizen</h1>
					</div>
				</header>
				
				
			</div>
		);
	}
}

	export default Header;

