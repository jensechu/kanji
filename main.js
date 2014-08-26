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
      self._selectKanji($selectedKanji);
    });
  }

  self._selectKanji = function($selectedKanji) {
    var existingKanji  = $selectedKanji.data('character');
    var selected       = $selectedKanji.hasClass('selected');

    $selectedKanji.toggleClass('selected');

    if (existingKanji && !selected) {
      self._getKanjiData($selectedKanji);
    }

    else if (existingKanji && selected) {
      self._removeKanjiRow(existingKanji);
    }
  }

  self._handleSelectorExpansion = function() {
    var $category = $kanjiSelectionBox.find('.category');

    $category.on('click', function() {
      var $selectedCategory = $(this);

      $category.siblings('.category-content').removeClass('expand');
      $selectedCategory.siblings('.category-content').addClass('expand');

    });
  }

  self._handleStrokeToggle = function() {
    var $strokeToggle = $('.strokeToggle');

    $strokeToggle.on('click', function() {
      self.toggleStroke();
    });
  }

  self.toggleStroke = function() {
    var $strokeToggle = $('.strokeToggle');

    $strokeToggle.toggleClass('selected');
    self.$contentBox.toggleClass('stroke-order');
  }

  self._removeKanjiRow = function(existingKanji) {
    $('.kanji-row[data-character="'+ existingKanji +'"]').remove();
  }

  self._setKanjiRow = function(kanji) {
    $contentBox.prepend(self.KANJI_TEMPLATE);

    var $kanjiRow       = $contentBox.children().first('.kanji-row');
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
    var $categoryBox = $kanjiSelectionBox.find('[data-category="'+ kanji.category +'"] .category-content');
    $categoryBox.append(self.SELECTOR_TEMPLATE);

    var $kanjiSelector = $categoryBox.children().last('li');

    $kanjiSelector.attr({
      'data-character': kanji.character,
      'data-meaning':   kanji.meaning,
      'data-onyomi':    kanji.onyomi,
      'data-kunyomi':   kanji.kunyomi
    });

    $kanjiSelector.text(kanji.character);
  }

  self._handleKanjiSearch = function() {
    var $kanjiSearch = $('.kanjiSearch');
    var $kanjiSubmit = $('.kanjiSubmit');

    $kanjiSubmit.on('click', function() {
      var kanji = $kanjiSearch.val();

      self._searchKanji(kanji);
    });
  }

  self._searchKanji = function(kanji) {
    var $searchedKanji = $kanjiSelectionBox.find('[data-character="'+ kanji +'"]');
    var kanjiExists    = $searchedKanji.length

    if(kanjiExists){
      self._selectKanji($searchedKanji);
    }
  }

  self._load = function(grade) {
    $.getJSON('data/'+ grade +'.json', function(data) {
      $.each( data.kanji, function( i, kanji ) {
	       self._setKanjiSelector(kanji);
      });
    }).done(function(){
      self._handleKanjiSelection();
      self._handleSelectorExpansion();
      self._handleKanjiSearch();
      self._handleStrokeToggle();
    });
  }

  self._load('kanji');

}

Kanji();
