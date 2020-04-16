import React from 'react';
import {render} from 'react-dom';
import {Router, Switch, Route} from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/Blocks';
import TxPool from "./components/TxPool";
import ConductTx from "./components/ConductTx";

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App}/>
            <Route path='/blocks' component={Blocks}/>
            <Route path='/conduct-tx' component={ConductTx}/>
            <Route path='/tx-pool' component={TxPool}/>
        </Switch>
    </Router>,
    document.getElementById('root')
);

