window.Kanji =  {

  SELECTOR_TEMPLATE:    $('#selectorTemplate').html().trim(),
  KANJI_TEMPLATE:       $('#kanjiTemplate').html().trim(),
  SUBCATEGORY_TEMPLATE: $('#subCategoryTemplate').html().trim(),
  $kanjiSelectionBox:   $('#kanjiSelectionBox'),
  $selectAllCheck:      $('.category-checkbox'),
  $contentBox:          $('#content'),
  $category:            $('#kanjiSelectionBox .category'),

  _getKanjiData: function($selectedKanji) {
    var kanji = {};

    kanji['character'] = $selectedKanji.data('character');
    kanji['meaning']   = $selectedKanji.data('meaning');
    kanji['onyomi']    = $selectedKanji.data('onyomi');
    kanji['kunyomi']   = $selectedKanji.data('kunyomi');

    Kanji._setKanjiRow(kanji);
  },

  _handleKanjiSelection: function() {
    Kanji.$kanjiSelectionBox.on('click', '.kanji-box', function(ev) {
      var $selectedKanji = $(ev.currentTarget);
      Kanji._selectKanji($selectedKanji);
    });

    console.log('lolll');

    Kanji.$selectAllCheck.on('click', function(ev) {
      var $selectedCategory = $(ev.currentTarget);
      var $selectedKanji    = $selectedCategory.parent().parent().find('.kanji-box');
      console.log('lol');

      $selectedCategory.toggleClass('checked');
      Kanji._toggleAllKanji($selectedKanji);
    });
  },

  _toggleAllKanji: function($selectedKanji) {
    $selectedKanji.each(function() {
      Kanji._selectKanji($(this));
    });
  },

  _selectKanji: function($selectedKanji) {
    var existingKanji  = $selectedKanji.data('character');
    var selected       = $selectedKanji.hasClass('selected');

    $selectedKanji.toggleClass('selected');

    if (existingKanji && !selected) {
      Kanji._getKanjiData($selectedKanji);
    }

    else if (existingKanji && selected) {
      Kanji._removeKanjiRow(existingKanji);
    }
  },

  _handleSectionExpansion: function() {
    Kanji.$category.on('click', function() {
      var $selectedCategory = $(this);

      Kanji.sectionExpansion($selectedCategory);

      Kanji.$category.siblings('.category-content').removeClass('expand');
      $selectedCategory.siblings('.category-content').addClass('expand');
    });
  },

  sectionExpansion: function($selectedCategory) {
    Kanji.$category.siblings('.category-content').removeClass('expand');
    $selectedCategory.siblings('.category-content').addClass('expand');
  },

  _handleStrokeToggle: function() {
    var $strokeToggle = $('.strokeToggle');

    $strokeToggle.on('click', function() {
      Kanji.toggleStroke();
    });
  },

  toggleStroke: function() {
    var $strokeToggle = $('.strokeToggle');

    $strokeToggle.toggleClass('selected');
    Kanji.$contentBox.toggleClass('stroke-order');
  },

  _removeKanjiRow: function(existingKanji) {
    $('.kanji-row[data-character="'+ existingKanji +'"]').remove();
  },

  _setKanjiRow: function(kanji) {
    var $kanjiRow       = $(Kanji.KANJI_TEMPLATE);
    var $kanjiCharacter = $kanjiRow.find('.kanji-character');
    var $kanjiMeaning   = $kanjiRow.find('.kanji-meaning');
    var $kanjiOnyomi    = $kanjiRow.find('.kanji-onyomi');
    var $kanjiKunyomi   = $kanjiRow.find('.kanji-kunyomi');

    $kanjiCharacter.text(kanji.character);
    $kanjiMeaning.text(kanji.meaning);
    $kanjiOnyomi.text(kanji.onyomi);
    $kanjiKunyomi.text(kanji.kunyomi);
    $kanjiRow.attr('data-character', kanji.character);

    Kanji.$contentBox.prepend($kanjiRow);
  },

  _setKanjiCategory: function(kanji) {
    var $categoryBox = Kanji.$kanjiSelectionBox.find('[data-category="'+ kanji.category +'"] .category-content');

    if (kanji.subCategory) {
      var $subCategory = $categoryBox.find('[data-subcategory="' + kanji.subCategory + '"]');
      var subCategorySet = $subCategory.length;

      if(!subCategorySet) {
        var $subCategory      = $(Kanji.SUBCATEGORY_TEMPLATE);
        var $subCategoryTitle = $subCategory.find('.subcategory-title');

        $subCategory.attr('data-subcategory', kanji.subCategory);
        $subCategoryTitle.text(kanji.subCategory);
        $categoryBox.prepend($subCategory);
      };

      Kanji._setKanjiSelector(kanji, $subCategory);
      return;
    };

    Kanji._setKanjiSelector(kanji, $categoryBox);
  },

  _setKanjiSelector: function(kanji, $container) {
    var $container = $container;
    $container.append(Kanji.SELECTOR_TEMPLATE);

    var $kanjiSelector = $container.children().last('li');

    $kanjiSelector.attr({
      'data-character': kanji.character,
      'data-meaning':   kanji.meaning,
      'data-onyomi':    kanji.onyomi,
      'data-kunyomi':   kanji.kunyomi
    });

    $kanjiSelector.text(kanji.character);
  },

  _handleKanjiSearch: function() {
    var $kanjiSearch = $('.kanjiSearch');
    var $kanjiSubmit = $('.kanjiSubmit');

    $kanjiSubmit.on('click', function() {
      var kanji = $kanjiSearch.val();

      Kanji._searchKanji(kanji);
    });
  },

  _searchKanji: function(kanji) {
    var $searchedKanji = this.$kanjiSelectionBox.find('[data-character="'+ kanji +'"]');
    var kanjiExists    = $searchedKanji.length

    if(kanjiExists){
      Kanji._selectKanji($searchedKanji);
    }
  },

  _load: function() {
    $.getJSON('data/kanji.json', function(data) {
      $.each( data.kanji, function( i, kanji ) {
        var $category = Kanji.$kanjiSelectionBox.find('[data-category="'+ kanji.category +'"] .category-content');
	      Kanji._setKanjiCategory(kanji);
      });
    }).done(function(){
      Kanji._handleKanjiSelection();
      Kanji._handleSectionExpansion();
      Kanji._handleKanjiSearch();
      Kanji._handleStrokeToggle();
    });
  }
};
