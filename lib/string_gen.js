module.exports = {

  generator: function () {
    var possibles = 'ABCDEFGABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var string = '';

    for(let i = 0; i < 6; i += 1) {
      string += possibles.charAt(Math.floor(Math.random() * possibles.length));

    }
    return string;
  }
}
