function EventsHelper() {
  var allEventsWatcher = undefined;

  var waitReceipt = function(transactionHash, address) {
    //console.log(transactionHash.transactionHash);
    return new Promise(function(resolve, reject) {
      var transactionCheck = function() {
       //web3.eth.getTransactionReceipt(transactionHash.transactionHash, function(err, transaction) {
      //  console.info(transaction);
        var receipt = transactionHash.receipt;
       // console.log(receipt);
        if (receipt) {
          var count = 0;
          if (address) {
            receipt.logs.forEach(function(log) {
              count += log.address === address ? 1 : 0;
            });
          } else {
            count = receipt.logs.length;
          }
          return resolve(count);
        }
//else {
//          setTimeout(transactionCheck, 100);
//        }
    //  });
      };
      transactionCheck();
    });
  };

  var waitEvents = function(watcher, count) {
    return new Promise(function(resolve, reject) {
      var transactionCheck = function() {
        watcher.get(function(err, events) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          if (events) {
            if (events.length == count) {
              return resolve(events);
            }
            if (events.length > count) {
              console.log(events);
              return reject("Filter produced " + events.length + " events, while receipt produced only " + count + " logs.");
            }
          }
          setTimeout(transactionCheck, 100);
        });
      };
      transactionCheck();
    });
  };

  this.getEvents = function(transactionHash, watcher) {
    if (allEventsWatcher === undefined) {
      throw "Call setupEvents before target transaction send."
    }
    return new Promise(function(resolve, reject) {
      waitReceipt(transactionHash, watcher.options.address).then(function(logsCount) {
        return waitEvents(allEventsWatcher, logsCount);
      }).then(function() {
        watcher.get(function(err, events) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          return resolve(events);
        });
      });
    });
  };

  this.setupEvents = function(contract) {
    allEventsWatcher = contract.allEvents();
    //console.log("all events for contract:" + JSON.stringify(allEventsWatcher, null, 5));
  }

  this.extractEvents = function(txHash, eventName) {
      if (txHash.logs.length == 0) {
          return [];
      }

      const logs = txHash.logs;
      var filteredLogs = [];
      for (logEntry of logs) {
          if (logEntry.event.toLowerCase() == eventName.toLowerCase()) {
              filteredLogs.push(logEntry);
          }
      }
      return filteredLogs
  }

  this.extractReceiptLogs = (tx, eventWatcher) => {
      return new Promise((resolve, reject) => {
          let receipt = tx.receipt
          if (receipt.logs.length == 0) {
              resolve([])
              return
          }

          var logs = []
          for (logEntry of receipt.logs) {
              if (logEntry.topics[0] === eventWatcher.options.topics[0]) {
                  logs.push(logEntry)
              }
          }

          resolve(logs)
      })
  }
};

module.exports = new EventsHelper();
