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
    var $selectableKanji = $kanjiSelectionBox.find('.kanji-box');

    $selectableKanji.on('click', function() {
      var $selectedKanji = $(this);
      var existingKanji  = $selectedKanji.data('character');
      var selected       = $selectedKanji.hasClass('selected');

      $selectedKanji.toggleClass('selected');

      if (existingKanji && !selected) {
        self._getKanjiData($selectedKanji);
      }

      else if (existingKanji && selected) {
        self._removeKanjiRow(existingKanji);
      }

    });
  }

  self._removeKanjiRow = function(existingKanji) {
    $('.kanji-row[data-character="'+ existingKanji +'"]').hide();
  }

  self._setKanjiRow = function(kanji) {
    $contentBox.append(self.KANJI_TEMPLATE);

    var $kanjiRow       = $contentBox.children().last('.kanji-row');
    var $kanjiCharacter = $kanjiRow.find('.kanji-character');
    var $kanjiMeaning   = $kanjiRow.find('.kanji-meaning');
    var $kanjiOnyomi    = $kanjiRow.find('.kanji-onyomi');
    var $kanjiKunyomi   = $kanjiRow.find('.kanji-kunyomi');


    $kanjiCharacter.text(kanji.character);
    $kanjiMeaning.text(kanji.meaning);
    $kanjiOnyomi.text(kanji.onyomi);
    $kanjiKunyomi.text(kanji.kunyomi);

    $kanjiRow.attr('data-character', kanji.character);
  }

  self._setKanjiSelector = function(kanji) {
    $kanjiSelectionBox.append(self.SELECTOR_TEMPLATE);
    var $kanjiSelector = $kanjiSelectionBox.children().last('li');

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
