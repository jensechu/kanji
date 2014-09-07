window.Anki = {
  db : [],  //maybe support more than one collection: so an array it is

  deckTree : {},

  handleLoadCollection : function() {
    var $ankiSubmit = $('.submitAnkiCollection');
    console.log("test anki handle");
    $ankiSubmit.on('click', function() {
      console.log("click anki submit button");
       var file = $('.inputAnkiCollection')[0].files[0];
      if(file !== null){
        Anki.loadDbFile(file);

      }
    });
  },

  loadDbFile : function(file) {
    console.log("load file");
    console.log(file);

    //check for html5 file stuff to be supported by browser
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var fileReader = new FileReader();
      fileReader.onload = function(){
        console.log("loaded db file");
        var UInts = new Uint8Array(fileReader.result);
        Anki.readDb(UInts);
      };
      fileReader.readAsArrayBuffer(file);
    }else {
      //Todo display browser is outdated or something like that
    }
  },

  readDb : function(UInts) {
    var sql = window.SQL;
    var db = new sql.Database(UInts);
    Anki.db[0] = db;
    console.log(db);
    var deckQuery = "SELECT decks FROM col";
    var result = db.exec(deckQuery);
    console.log(result);

    var decks = JSON.parse(result[0].values[0][0]);
    console.log(decks);
    Anki._parseDecks(decks);
    //console.log(Anki._parseFields(result[0].values[0][0]))
  },

  _parseDecks : function(decks) {
    $.each(decks, function(id, deck){
      var deckBranch = deck.name.split("::");
      var i;
      if(Anki.deckTree[deckBranch[0]] === undefined){
        Anki.deckTree[deckBranch[0]] = {};
      }
      var currentObject = Anki.deckTree[deckBranch[0]];
      if(deckBranch.length === 1){
        currentObject.data = deck;
      }
      for(i = 1; i< deckBranch.length; i++){
        if(currentObject[deckBranch[i]] === undefined){
          currentObject[deckBranch[i]] = {};
        }
        currentObject = currentObject[deckBranch[i]];


        if(i  === deckBranch.length -1){
          currentObject.data = deck;
        }

      }

    });
    console.log(Anki.deckTree);
  },

  //Todo: check if replacements done in AnkiDroid are necessary here too (desktop version does none)
  _parseFields : function(fields) {
    var split = fields.split("\x1f");
    return split;
  },

  init: function() {
    Anki.handleLoadCollection();
  }
};
