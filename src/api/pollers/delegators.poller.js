/* eslint-disable array-callback-return */
// https://github.com/snwolak/get_steem_delegations/blob/master/index.js
const steem = require('steem');
const fs = require('fs');
const config = require('../../config/vars');
const logger = require('../../config/logger');

let store = [];

const getData = async () => {
  let data;
  // Number of the operation, it has to be the same or higher than limit
  const from = store === undefined || store.length === 0 ? 10000000 : store[store.length - 1][0];

  await steem.api.getAccountHistoryAsync(config.delegationsAccount, from, from < 1000 ? from : 1000).then((res) => {
    const sorted = res.sort((a, b) => {
      const x = a[1].block;
      const y = b[1].block;
      if (x < y) { return 1; }
      if (x > y) { return -1; }
      return 0;
    });
    data = sorted;

    return res;
  }).catch((err) => {
    if (err) logger.info(err);
  });

  if (store.length === 0) {
    store = data;
    await getData();
    return null;

    // if pulled data is the same function stops here
  } else if (data[data.length - 1][1].block === store[store.length - 1][1].block) {
    let arr = [];

    // filtering to get only delegations
    const filtered = store.filter(op => op[1].op[0] === 'delegate_vesting_shares');

    filtered.map((sponsor) => {
      const obj = {
        delegator: sponsor[1].op[1].delegator,
        vesting_shares: Number(sponsor[1].op[1].vesting_shares.split(' ')[0]),
        block: sponsor[1].block,
        trx_id: sponsor[1].trx_id,
      };

      // checking if delegator already exists in array
      const check = arr.find(x => x.delegator === obj.delegator);

      if (check !== undefined) {
        if (check.block < sponsor[1].block) {
          // if delegation is newer it will replace the old one
          const filteredtmp = arr.filter(item => item.trx_id !== check.trx_id);
          arr = filteredtmp;
          arr.push(obj);
        }
      } else {
        arr.push(obj);
      }
    });

    // deleting delegations with zero vests
    const filterZeroVesting = arr.filter(item => item.vesting_shares !== 0);

    const sorted = filterZeroVesting.sort((a, b) => {
      const x = a.vesting_shares;
      const y = b.vesting_shares;
      if (x < y) { return 1; }
      if (x > y) { return -1; }
      return 0;
    });

    fs.writeFile('src/assets/delegations.json', JSON.stringify(sorted), (err) => {
      if (err) logger.info(err);
    });

    return null;
  }
  store = store.concat(data);
  await getData();
  return null;
};

exports.start = async () => {
  logger.info('Starting delegators polling service...');
  await getData().catch((err) => {
    if (err) logger.info(err);
  });
  logger.info('Delegations downloaded.', Date.now());
};
