window.Anki = {
  db : [],
  deckTree : {},
  chosenDecks : {},

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
        if(currentObject.subDecks === undefined){
          currentObject.subDecks = {};
        }
        if(currentObject.subDecks[deckBranch[i]] === undefined){
          currentObject.subDecks[deckBranch[i]] = {};
        }
        currentObject = currentObject.subDecks[deckBranch[i]];
        if(i  === deckBranch.length -1){
          currentObject.data = deck;
        }
      }

    });
    Anki._displayDecks();
    Anki._addCheckBoxClickHandler();
    console.log(Anki.deckTree);
  },

  //display root decks of collection
  _displayDecks : function(){
    var $ankiContent = $('.ankiContent');
    var $listRoot = $('<ul>');
    $.each(Anki.deckTree, function(deckName, deck){
      var $deckCheckBox = $('<input>',{ 'type' : 'checkbox', 'id' : 'cb-'+deck.data.id, 'name' : deck.data.id });
      $deckCheckBox.addClass('ankiDeckCheckbox').addClass('root-did'+deck.data.id);
      var $deckListElement = $('<li>');
      var $deckListLabel = $('<label>').attr('for', 'cb-'+deck.data.id);
      $deckListLabel.text(deckName);
      $deckListElement.append($deckCheckBox);
      $deckListElement.append($deckListLabel);
      $listRoot.append($deckListElement);
      if(deck.subDecks !== undefined){
        Anki._addSubdecks($deckListElement, deck, [deck.data.id]);
      }
    });

    $ankiContent.append($listRoot);

  },

  //display subdecks of other decks, subdecks (this is a recursive function!)
  _addSubdecks : function($deckListElement, currentDeck, rootDecks){
    var $listRoot = $('<ul>');

    $.each(currentDeck.subDecks, function(deckName, deck){
      var $deckCheckBox = $('<input>',{ 'type' : 'checkbox', 'id' : 'cb-'+deck.data.id, 'name' : deck.data.id });
      $deckCheckBox.addClass('ankiDeckCheckbox').addClass('root-did'+deck.data.id);
      var i;
      for(i = 0; i < rootDecks.length; i++){
        $deckCheckBox.addClass('did'+rootDecks[i]);
      }
      var $deckListElement = $('<li>');
      var $deckListLabel = $('<label>').attr('for', 'cb-'+deck.data.id);
      $deckListLabel.text(deckName);
      $deckListElement.append($deckCheckBox);
      $deckListElement.append($deckListLabel);
      $listRoot.append($deckListElement);
      if(deck.subDecks !== undefined){
        var newRootDecks = rootDecks.slice();
        console.log(newRootDecks);
        newRootDecks.push(deck.data.id);
        console.log(newRootDecks);
        Anki._addSubdecks($deckListElement, deck, newRootDecks);
      }
    });

    $deckListElement.append($listRoot);
  },

  _addCheckBoxClickHandler : function(){
    $('.ankiDeckCheckbox').on('click', function(e) {
      var $thisBox = $(this);
      var checkBoxClass;
      if ($thisBox.prop('checked')) {
        Anki.chosenDecks[$thisBox.attr('name')] = true;

      } else {
        Anki.chosenDecks[$thisBox.attr('name')] = false;
      }
      Anki._getKanjis();
    });

  },

  _getKanjis : function(){
    var db =  Anki.db[0];
    var fldsQuery = "SELECT notes.flds FROM notes, cards " +
      "WHERE cards.nid=notes.id " +
      "   AND cards.did in " + Anki._getSelectedDecks();
    console.log(fldsQuery);
    var result = db.exec(fldsQuery);
    console.log(result);
  },

  _getSelectedDecks : function(){
    var selectedDecks = [];
    $.each(Anki.chosenDecks, function(deck, is_chosen){
      if(is_chosen){
        selectedDecks.push(deck);
      }
    });
    return '('+selectedDecks.join()+')';
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
