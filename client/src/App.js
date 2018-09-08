import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import Header from './Components/HeaderComponents/header'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


import "./App.css";


class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null ,table:[]};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(SimpleStorageContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.set(5, { from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.get();

    // Update state with the result.
    this.setState({ storageValue: response.toNumber() });
  };


  renderTable() {
    var context = this
    console.log('jhgjhg')
    /*var pp  = React.createElement('tbody', {'id': 'table-body'}, p)

    console.log(pp)
    context.setState({table: pp})*/
    //context.iconNode.props.className = 'glyphicon glyphicon-arrow-up'
    
    console.log(context.fetchedComplains)
    var reactTableRows = []
    for(var i = 0; i<context.fetchedComplains.length; i++) {

      var fetchData = context.fetchedComplains[i]
      var details = fetchData.data.split('?')
          //console.log(details)

          var _th  = <th scope="row">{fetchData.cid}</th>
          var _td1 = <td>{details[0]}</td>
          var _td2 = <td>{details[1]}</td>
          var _td3 = <td>{details[2]}</td>
          var _td4 = <td>{context.catType(fetchData.cat)}</td>
          var _td5 = <td>&#8377; {(fetchData.reward/1e9).toFixed(2)}</td>
          var _td6 = <td><p className={context.statusType(fetchData.status)}>{context.statusType(fetchData.status)}</p></td>
          var _td7 = <td className="action-class">
            <span className={context.state.secondBtn+" label label-success"}>
              <span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.tipFirst} className={context.state.classFirst} aria-hidden="true" onClick={context.actionFirstButton}></span>
            </span>
            <span className={context.state.secondBtn+" label label-primary"}>
              <span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.tipSecond} className={context.state.classSecond} aria-hidden="true" onClick={context.actionSecondButton}></span>
            </span>
            <span className={context.state.polFund+" label label-info"}>
              <span data-index={i} data-toggle="tooltip" data-placement="left" title={context.state.polTip} className="glyphicon glyphicon-flash" aria-hidden="true" onClick={context.actionPolFund}></span>
            </span>
            <span className={context.state.isCitizen+" label label-info"} >
              <span data-index={i} data-toggle="tooltip" data-placement="left" title="Close/Resolve Complain [Funds will be awarded or sent back]" className="glyphicon glyphicon-ok" aria-hidden="true" onClick={context.actionThirdButton}></span>
            </span>
            <span className={context.state.isCitizen+" label label-danger"} >
              <span data-index={i} data-toggle="tooltip" data-placement="left" title="Decline Proposal" className="glyphicon glyphicon-remove" aria-hidden="true" onClick={context.actionFourthButton}></span>
            </span>
            </td>


          //var t = <tr></tr>

          //var u = React.cloneElement(t)
          //var _td = <td>Hello</td>
          var _tr = <tr>{_th}{_td1}{_td2}{_td3}{_td4}{_td5}{_td6}{_td7}</tr>

          reactTableRows.push(_tr)

          
    } 
    var reactTBody  = React.createElement('tbody', {'id': 'table-body'}, reactTableRows)

    console.log(reactTBody)
    return reactTBody
    //context.setState({table: pp})
      //p.push(_tr)
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
      <Header />
        <table className="table" id="table-data"> 
            <thead> 
              <tr> 
                <th>#</th> 
                <th>submitter_name</th> 
                <th>content</th>
                <th>total_reward</th>
                <th>status</th> 
                <th>solver</th>
              </tr> 
            </thead>

              {this.state.table}


          </table> 
      </div>
    );
  }
}

export default App;
