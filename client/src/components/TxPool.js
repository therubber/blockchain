import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Tx from './Tx';

class TxPool extends Component {

    state = {txPoolMap: {}};

    fetchTxPoolMap = () => {
        fetch('http://localhost:3000/api/tx-pool-map')
            .then(response => response.json())
            .then(json => this.setState({txPoolMap: json}));
    }

    componentDidMount() {
        this.fetchTxPoolMap();
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

