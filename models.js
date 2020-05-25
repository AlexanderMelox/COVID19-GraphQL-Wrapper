const axios = require('axios');
const moment = require('moment');
const { urls } = require('./utils');

module.exports = {
  Case: {
    async getAllCases() {
      const { data } = await axios.get(urls.cases);
      const now = moment();
      data.forEach(c => {
        c.lastUpdate = now.from(moment(c.lastUpdate));
      });
      return data;
    }
  }
}
