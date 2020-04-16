import React, {Component} from 'react';
import logo from '../assets/coin.png';
import '../index.css';
import {Link} from "react-router-dom";

class App extends Component {
    state = {walletInfo: {}}

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(json => this.setState({walletInfo: json}));
    }

    render() {
        const {address, balance} = this.state.walletInfo;
        return (
            <div className='App'>
                <img className='logo' src={logo} alt='blockchain-logo'/>
                <br/>
                <div>Welcome to the Blockchain!</div>
                <br/>
                <div className='WalletInfo'>
                    <div>Address: <br/> {address}</div>
                    <br/>
                    <div>Balance: <br/> {balance}</div>
                </div>
                <br/>
                <div><Link to='/conduct-tx'>New transaction</Link></div>
                <br/>
                <div><Link to='/blocks'> Blocks</Link></div>
                <br/>
                <div><Link to='/tx-pool'>Transaction Pool</Link></div>
            </div>
        );
    }
}

export default App;