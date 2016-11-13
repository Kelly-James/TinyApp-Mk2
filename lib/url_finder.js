module.exports = {

  find: function findLongUrl(shortUrl) {
    for(let userId of Object.keys(userDatabase)) {
      for(let urlId of Object.keys(userDatabase[userId]['urls'])) {
        if(urlId === shortUrl) {
          return userDatabase[userId]['urls'][urlId];
        }
      }
    }
  }

}


// let longURL = '';
// Object.keys(userDatabase).forEach(function(userId) {
//   console.log(userId);
//   Object.keys(userDatabase[userId]['urls']).forEach(function(urlId) {
//     console.log(urlId);
//     if(urlId === shortUrl) {
//       console.log(userDatabase[userId]['urls'][urlId]);
//       longURL = userDatabase[userId]['urls'][urlId];
//       return;
//     }
//   })
//   if(longURL) {
//     return;
//   }
// })
// return longURL;
