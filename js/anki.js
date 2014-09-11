window.Anki = {
  db : {},
  decks : {},
  models : {},
  deckTree : {},
  chosenDecks : {},
  associatedModels : [],


  handleLoadCollection : function() {
    var $ankiSubmit = $('.submitAnkiCollection');
    $ankiSubmit.on('click', function() {
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
        console.log("collection loaded")
      };
      fileReader.readAsArrayBuffer(file);
    }else {
      //Todo display browser is outdated or something like that
    }
  },

  readDb : function(UInts) {
    var sql = window.SQL;
    var db = new sql.Database(UInts);
    if(db === undefined){
      console.log("error loading file"); //Todo add some user notification
      return undefined;
    }
    console.log("loaded file as SqLite database");
    Anki.db = db;
    Anki._parseCollectionConfig();
  },

  _parseCollectionConfig : function() {
    //query existing decks in collection
    var deckQuery = "SELECT decks FROM col";
    var result = Anki.db.exec(deckQuery);
    console.log(result);
    var decks = JSON.parse(result[0].values[0][0]);
    Anki.decks = decks;
    //query existing card models
    var modelQuery = "SELECT models FROM col";
    result = Anki.db.exec(modelQuery);
    Anki.models = JSON.parse(result[0].values[0][0]);
    console.log(Anki.models);
    Anki._parseDecks();
  },

  _parseDecks : function() {
    $.each(Anki.decks, function(id, deck){
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
    $ankiContent.empty();
    $deckHeader = $("<h3>");
    $deckHeader.text("Select Deck(s)");
    $ankiContent.append($deckHeader);
    var $listRoot = $('<ul>').addClass('ankiDeckList');
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
    var $submitDeckListButton = $('<button>').addClass('submitAnkiDeck');
    $submitDeckListButton.text('next Step');
    $ankiContent.append($submitDeckListButton);
    $submitDeckListButton.on('click', function(e){
      $ankiContent.empty();
      Anki._loadAssociatedCardModels($ankiContent);
    });

  },

  //display subdecks of other decks, subdecks (this is a recursive function!)
  _addSubdecks : function($deckListElement, currentDeck, rootDecks){
    var $listRoot = $('<ul>').addClass('subDeckList');

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
    });

  },

  _loadAssociatedCardModels : function($ankiContent){
    var modelQuery = "SELECT notes.mid " +
      "FROM notes, cards " +
      "WHERE cards.nid = notes.id " +
      "  AND cards.did in " + Anki._getSelectedDecks()+
      " group by notes.mid";
    console.log(modelQuery);
    var result = Anki.db.exec(modelQuery);
    console.log(result);
    var rawModelList = result[0].values;

    var i;

    var $listRoot = $('<ul>').addClass('ankiDeckList');

    for(i= 0; i<rawModelList.length; i++){
      var modelId = result[0].values[i][0];

      var $rootElement = $("<li>");
      $listRoot.append($rootElement);
      var $listRootLabel = $('<label>');
      $listRootLabel.text(Anki.models[modelId].name);
      $rootElement.append($listRootLabel);

      var $modelListRoot = $('<ul>').addClass('subDeckList');
      $rootElement.append($modelListRoot);

      Anki.associatedModels.push(modelId);

      var j = 0;
      for(j=0; j<Anki.models[modelId].flds.length; j++){
        var $modelRadioItem = $('<input>',{ 'type' : 'radio', 'id' : 'aR-'+modelId+"-"+j, 'name' : modelId });
        $modelRadioItem.addClass('ankiModelRadio');
        var $modelListElement = $('<li>');
        var $modelListLabel = $('<label>').attr('for', 'aR-'+modelId+"-"+j);
        $modelListLabel.text(Anki.models[modelId].flds[j].name);
        $modelListElement.append($modelRadioItem);
        $modelListElement.append($modelListLabel);
        $modelListRoot.append($modelListElement);
      }
    }
    $ankiContent.append($listRoot);

  },

  _getKanjis : function(){
    var fldsQuery = "SELECT notes.flds FROM notes, cards " +
      "WHERE cards.nid=notes.id " +
      "   AND cards.did in " + Anki._getSelectedDecks() +
      "group by notes.id";
    console.log(fldsQuery);
    var result = Anki.db.exec(fldsQuery);
    console.log(result);
    if(result[0] != undefined) {
      console.log(Anki._parseFields(result[0].values[0][0])[0]);
    }
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
