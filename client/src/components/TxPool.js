import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Tx from './Tx';

const POLL_INTERVAL_MS = 10000;

class TxPool extends Component {

    state = {txPoolMap: {}};

    fetchTxPoolMap = () => {
        fetch(`${document.location.origin}/api/tx-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({txPoolMap: json}));
    }

    componentDidMount() {
        this.fetchTxPoolMap();

        this.fetchPoolMapInterval = setInterval(() => this.fetchTxPoolMap(), POLL_INTERVAL_MS);
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolMapInterval);
    }

    render() {
        return (
            <div className='TxPool'>
                <h3>Transaction Pool</h3>
                <div><Link to='/'>Back to wallet</Link></div>
                <br/>
                <hr color='#fff'/>
                {
                    Object.values(this.state.txPoolMap).map(tx => {
                        return (
                            <div key={tx.id}>
                                <hr/>
                                <Tx tx={tx}/>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default TxPool;

