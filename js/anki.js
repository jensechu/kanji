window.Anki = {
  db : {},
  decks : {},
  models : {},
  deckTree : {},
  chosenDecks : {},
  associatedModels : {},
  filterSettings : {
    'maxEase' : 500,
    'isOnlyNewCards' : false
  },
  kanjiList : [],


  handleLoadCollection : function() {
    'use strict';
    var $ankiSubmit = $('.submitAnkiCollection');
    $ankiSubmit.on('click', function() {
       var file = $('.inputAnkiCollection')[0].files[0];
      if(file !== null){
        Anki.loadDbFile(file);
      }
    });
  },

  loadDbFile : function(file) {
    'use strict';
    console.log("load file");
    console.log(file);

    //check for html5 file stuff to be supported by browser
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var fileReader = new FileReader();
      fileReader.onload = function(){
        console.log("loaded db file");
        var UInts = new Uint8Array(fileReader.result);
        Anki.readDb(UInts);
        console.log("collection loaded");
      };
      fileReader.readAsArrayBuffer(file);
    }//Todo: else: display browser is outdated or something like that
  },

  readDb : function(UInts) {
    'use strict';
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
    'use strict';
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
    'use strict';
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
    'use strict';
    var $ankiContent = $('.ankiContent');
    $ankiContent.empty();
    var $deckHeader = $("<h3>");
    $deckHeader.text("Select Deck(s)");
    $ankiContent.append($deckHeader);
    var $listRoot = $('<ul>').addClass('ankiDeckList');
    $.each(Anki.deckTree, function(deckName, deck){
      var $deckCheckBox = $('<input>',{ 'type' : 'checkbox', 'id' : 'cb-'+deck.data.id, 'name' : deck.data.id });
      $deckCheckBox.addClass('ankiDeckCheckbox').addClass('root-did'+deck.data.id);
      $deckCheckBox.addClass('cb-unchecked');
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

  //display subdecks of other decks (this is a recursive function!)
  _addSubdecks : function($deckListElement, currentDeck, rootDecks){
    'use strict';
    var $listRoot = $('<ul>').addClass('subDeckList');

    $.each(currentDeck.subDecks, function(deckName, deck){
      var $deckCheckBox = $('<input>',{ 'type' : 'checkbox', 'id' : 'cb-'+deck.data.id, 'name' : deck.data.id });
      $deckCheckBox.addClass('ankiDeckCheckbox').addClass('root-did'+deck.data.id);
      $deckCheckBox.addClass('cb-unchecked');
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
    'use strict';
    $('.ankiDeckCheckbox').on('click', function(e){
      var $thisBox = $(this);
      var checkBoxClass;
      if($thisBox.prop('checked')){
        $thisBox.removeClass('cb-unchecked');
        $thisBox.addClass('cb-checked');
        checkBoxClass = '.cb-unchecked';
        Anki.chosenDecks[$thisBox.attr('name')] = true;
      }else {
        $thisBox.addClass('cb-unchecked');
        $thisBox.removeClass('cb-checked');
        checkBoxClass = '.cb-checked';
        Anki.chosenDecks[$thisBox.attr('name')] = false;
      }


      //trigger parent on uncheck and childs on check
      //add and filter .triggered class to prevent retriggering cascade
      //TODO maybe add intermediate state (-> not unselect subdecks -> unchecked state: unselect all)
      var classList = $thisBox.attr('class').split(/\s+/);
      if(!$thisBox.prop('checked')) { //maybe not do the following, only execute else
        $.each(classList, function (index, item) {
          if (item.indexOf('did') === 0) {
            var $otherCheckBox = $(checkBoxClass + '.root-' + item);
            $otherCheckBox = $otherCheckBox.not('.triggered');
            $otherCheckBox.addClass('triggered');
            $otherCheckBox.trigger("click");
            $otherCheckBox.removeClass('triggered');
          }
        });
      }else {
        var root_id = $thisBox.attr('id').substr(3);
        var $branches = $(checkBoxClass + '.did' + root_id);
        $branches = $branches.not('.triggered');
        $branches.addClass('triggered');
        $branches.trigger("click");
        $branches.removeClass('triggered');
        console.log($branches);
      }
      //console.log(Anki.chosenDecks);
    });
  },

  _loadAssociatedCardModels : function($ankiContent){
    'use strict';
    var modelQuery = "SELECT notes.mid " +
      "FROM notes, cards " +
      "WHERE cards.nid = notes.id " +
      "  AND cards.did in " + Anki._getSelectedDecks()+
      " group by notes.mid";
    console.log(modelQuery);
    var result = Anki.db.exec(modelQuery);
    console.log(result);

    var $ModelHeader = $("<h3>");
    $ModelHeader.text("Select Model fields");
    $ankiContent.append($ModelHeader);

    var rawModelList = result[0].values;
    var $listRoot = Anki._createModelList(rawModelList, result);

    $ankiContent.append($listRoot);
    var $submitModelFieldChoiceButton = $('<button>').addClass('submitAnkiModelField');
    $submitModelFieldChoiceButton.text('next Step');
    $ankiContent.append($submitModelFieldChoiceButton);

    //next step
    $submitModelFieldChoiceButton.on('click', function(e){
      $ankiContent.empty();
      Anki._filterSettings($ankiContent);
    });
  },

  _createModelList : function(rawModelList, result){
    'use strict';
    var $listRoot = $('<ul>').addClass('ankiDeckList');
    var i;
    for(i= 0; i<rawModelList.length; i++){
      var modelId = result[0].values[i][0];

      var $rootElement = $("<li>");
      $listRoot.append($rootElement);
      var $listRootLabel = $('<label>');
      $listRootLabel.text(Anki.models[modelId].name);
      $rootElement.append($listRootLabel);

      var $modelListRoot = $('<ul>').addClass('subDeckList');
      $modelListRoot.attr('id', 'model-'+ modelId);
      $rootElement.append($modelListRoot);
      Anki.associatedModels[modelId] = {
        'fieldNumber' : 0
      };

      var j = 0;
      for(j=0; j<Anki.models[modelId].flds.length; j++){
        var $modelRadioItem = $('<input>',{ 'type' : 'radio', 'id' : 'aR-'+modelId+"-"+j, 'name' : modelId });
        if(j===0){
          $modelRadioItem.prop('checked', true);
        }
        $modelRadioItem.addClass('ankiModelRadio');
        var $modelListElement = $('<li>');
        var $modelListLabel = $('<label>').attr('for', 'aR-'+modelId+"-"+j);
        $modelListLabel.text(Anki.models[modelId].flds[j].name);
        $modelListElement.append($modelRadioItem);
        $modelListElement.append($modelListLabel);
        $modelListRoot.append($modelListElement);
      }
    }
    return $listRoot;
  },

  _filterSettings : function($ankiContent){
    'use strict';
    var $FilterHeader = $("<h3>");
    $FilterHeader.text("Filter cards by new cards or difficulty");
    $ankiContent.append($FilterHeader);

    var $onlyNewCardsLabel = $('<label>');
    $onlyNewCardsLabel.text('only new unlearned cards');
    var $onlyNewCardsCheckbox = $('<input>',{ 'type' : 'checkbox', 'id' : 'ankiCbNewCards', 'name' : 'ankiCbNewCards' });
    $onlyNewCardsLabel.attr('for', 'ankiCbNewCards');
    $ankiContent.append($onlyNewCardsLabel);
    $ankiContent.append($onlyNewCardsCheckbox);

    var $easeLabel = $('<label>');
    $easeLabel.text('select max ease: ');
    var $easeSelect = Anki._createEaseSelect();

    var $easeDiv = $('<div>').addClass('ankiEase');

    //$easeDiv.append('<br /><br />');
    $easeDiv.append($easeLabel);
    $easeDiv.append($easeSelect);
    $easeDiv.append('<br />(Select low values to include only difficult cards. ' +
      'Select the highest value to include all cards. ' +
      'New cards will only be included by checking the option above.)');
    $ankiContent.append($easeDiv);
    Anki._registerFilterOptionHandler ($easeSelect, $onlyNewCardsCheckbox, $easeDiv);


    var $submitFilterOptionsButton = $('<button>').addClass('submitAnkiModelField');
    $submitFilterOptionsButton.text('get my Kanjis!');
    $ankiContent.append($submitFilterOptionsButton);
    //next step
    $submitFilterOptionsButton.on('click', function(e){
      $ankiContent.empty();
      Anki._getKanjis($ankiContent);
    });
  },


  _getEaseForSelection : function(){
    'use strict';
    var easeQuery = "SELECT cards.factor/10 " +
      "FROM cards, notes " +
      "WHERE cards.nid = notes.id " +
      "  AND cards.factor > 0 " +
      "  AND cards.did in " + Anki._getSelectedDecks() + " " +
      "GROUP BY cards.factor "+
      "ORDER BY cards.factor";
    console.log(easeQuery);
    var result = Anki.db.exec(easeQuery);
    var rawEaseList = result[0].values;
    var easeList = [];
    var i;
    for(i=0; i<rawEaseList.length; i++){
      easeList.push(result[0].values[i][0]);
    }
    return easeList;
  },

  _createEaseSelect : function(){
    'use strict';
    var $difficultySelect = $('<select name="ankiEase" size="1">');
    var easeList = Anki._getEaseForSelection();
    var i;
    for(i = easeList.length - 1; i >= 0; i--){
      var $easeOption = $('<option>').attr('value', easeList[i]);
      $easeOption.append(easeList[i]);
      if(i === easeList.length -1){
        $easeOption.attr('selected', 'selected');
        Anki.filterSettings.maxEase = easeList[i];
      }
      $difficultySelect.append($easeOption);
    }
    return $difficultySelect;
  },

  _registerFilterOptionHandler : function($easeSelect, $onlyNewCardsCheckbox, $easeDiv){
    'use strict';
    $onlyNewCardsCheckbox.on('click', function(e){
      if($onlyNewCardsCheckbox.prop('checked')){
        $easeDiv.hide();
        Anki.filterSettings.isOnlyNewCards = true;
      } else {
        $easeDiv.show();
        Anki.filterSettings.isOnlyNewCards = false;
      }
    });

    $easeSelect.on('change', function(e){
      Anki.filterSettings.maxEase = $easeSelect.val();
    });
  },

  //load card fields and filter out kanji from the selection
  _getKanjis : function(){
    'use strict';
    var fldsQuery = "SELECT notes.flds, cards.factor, notes.mid  FROM notes, cards " +
      "WHERE cards.nid=notes.id " +
      "  AND cards.did in " + Anki._getSelectedDecks() + " " +
      Anki._getFilterOptions() +
      "group by notes.id " +
      "ORDER BY cards.factor asc";
    console.log(fldsQuery);
    var result = Anki.db.exec(fldsQuery);
    console.log(result);
    if(result[0] !== undefined) {
      var fieldList = result[0].values;
      Anki._parseFieldList(fieldList);
    }
  },

  _parseFieldList : function(fieldList){
    'use strict';
    var i, rawFields, modelId, fields, selectedField, kanjis, fieldKanjiList;
    for(i = 0; i < fieldList.length; i++){
      rawFields =fieldList[i][0];
      modelId = fieldList[i][2];
      fields = Anki._parseFields(rawFields);
      selectedField = fields[Anki.associatedModels[modelId].fieldNumber];
      kanjis = selectedField.replace(/[^\u4e00-\u9faf]/g,''); //remove all non kanji characters
      fieldKanjiList = kanjis.split('');
      var j;
      for(j = 0; j < fieldKanjiList.length ; j++){
        if($.inArray(fieldKanjiList[j], Anki.kanjiList) === -1){
          Anki.kanjiList.push(fieldKanjiList[j]);
        }
      }
    }
    console.log(Anki.kanjiList);

    //load the apps kanji list anew to expand our own simple kanji list in the expected format
    $.getJSON('data/kanji.json' , Anki._prepareKanjiList);
  },


  _prepareKanjiList : function(data){
    'use strict';
    //console.log(data);
    var i, kanjiIndex;
    for(i = 0; i < data.kanji.length; i++){
      kanjiIndex = $.inArray(data.kanji[i].character, Anki.kanjiList);
      if(kanjiIndex >= 0){
        Anki.kanjiList[kanjiIndex] = data.kanji[i];
        Anki.kanjiList[kanjiIndex].category = "anki";
      }
    }

    Anki._setUserKanji();
  },

  _setUserKanji: function() {
    'use strict';
    var $selectedCategory = $('.categoryBox[data-category="anki"] h2');
    $.each(Anki.kanjiList, function(i, kanji) {
      if(typeof kanji !== 'string'){
        window.Kanji._setKanjiSelector(kanji);
      }
    });
    window.Kanji.sectionExpansion($selectedCategory);
  },

  //Utility functions
  _getSelectedDecks : function(){
    'use strict';
    var selectedDecks = [];
    $.each(Anki.chosenDecks, function(deck, is_chosen){
      if(is_chosen){
        selectedDecks.push(deck);
      }
    });
    return '('+selectedDecks.join()+')';
  },

  _getFilterOptions : function(){
    'use strict';
    if(Anki.filterSettings.isOnlyNewCards){
      return 'AND cards.queue = 0 ';
    }
    return 'AND cards.factor <= ' + (Anki.filterSettings.maxEase*10) + " AND cards.factor > 0 ";

  },

  //Todo: check if replacements done in AnkiDroid are necessary here too (desktop version does none)
  _parseFields : function(fields) {
    'use strict';
    var split = fields.split("\x1f");
    return split;
  },

  //Entry point
  init: function() {
    'use strict';
    Anki.handleLoadCollection();
  }
};
