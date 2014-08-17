Kanji = function() {
  var self = this;

  self.SELECTOR_TEMPLATE  = $('#selectorTemplate').html();
  self.KANJI_TEMPLATE     = $('#kanjiTemplate').html();
  self.$kanjiSelectionBox = $('#kanjiSelectionBox');
  self.$contentBox        = $('#content');

  self._getKanjiData = function($selectedKanji) {
    var kanji = {};

    kanji['character'] = $selectedKanji.data('character');
    kanji['meaning']   = $selectedKanji.data('meaning');
    kanji['onyomi']    = $selectedKanji.data('onyomi');
    kanji['kunyomi']   = $selectedKanji.data('kunyomi');

    self._setKanjiRow(kanji);
  }

  self._handleKanjiSelection = function() {
    $selectableKanji = $kanjiSelectionBox.find('.kanji-box');

    $selectableKanji.on('click', function() {
      $selectedKanji = $(this);

      if ($selectedKanji.data('character')) {
        self._getKanjiData($selectedKanji);
      }

    });
  }

  self._setKanjiRow = function(kanji) {
    $contentBox.append(self.KANJI_TEMPLATE);
    $kanjiRow = $contentBox.children().last('.kanji-row');

    $kanjiCharacter = $kanjiRow.find('.kanji-character');
    $kanjiMeaning   = $kanjiRow.find('.kanji-meaning');
    $kanjiOnyomi    = $kanjiRow.find('.kanji-onyomi');
    $kanjiKunyomi   = $kanjiRow.find('.kanji-kunyomi');


    $kanjiCharacter.text(kanji.character);
    $kanjiMeaning.text(kanji.meaning);
    $kanjiOnyomi.text(kanji.onyomi);
    $kanjiKunyomi.text(kanji.kunyomi);
  }

  self._setKanjiSelector = function(kanji) {
    $kanjiSelectionBox.append(self.SELECTOR_TEMPLATE);
    $kanjiSelector = $kanjiSelectionBox.children().last('li');

    $kanjiSelector.attr({
      'data-character': kanji.character,
      'data-meaning':   kanji.meaning,
      'data-onyomi':    kanji.onyomi,
      'data-kunyomi':   kanji.kunyomi
    });

    $kanjiSelector.text(kanji.character);
  }

  self._load = function(grade) {
    $.getJSON('data/'+ grade +'.json', function(data) {
      $.each( data.kanji, function( i, kanji ) {
	       self._setKanjiSelector(kanji);
      });
    }).done(function(){
      self._handleKanjiSelection();
    });
  }

  self._load('kanji');

}

Kanji();
