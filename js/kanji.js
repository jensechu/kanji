window.Kanji =  {

  SELECTOR_TEMPLATE:    $('#selectorTemplate').html().trim(),
  KANJI_TEMPLATE:       $('#kanjiTemplate').html().trim(),
  $kanjiSelectionBox:   $('#kanjiSelectionBox'),
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

  _setKanjiRow: function(kanji, cb) {
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

  _setKanjiSelector: function(kanji) {
    var $categoryBox = Kanji.$kanjiSelectionBox.find('[data-category="'+ kanji.category +'"] .category-content');
    
    if (kanji.hasOwnProperty('subcategory')) {
      var $subcategoryBox = $categoryBox.find('[data-subcategory="'+ kanji.subcategory + '"]');
      
      if ($subcategoryBox.size() == 0) {
        $subcategoryBox = $categoryBox.append(
        '    <div class="subcategoryBox" data-subcategory="'+ kanji.subcategory +'">' +
        '      <h2 class="subcategory">'+ kanji.subcategory +'</h2>' +
        '    </div>'
        );
      }
      $categoryBox = $subcategoryBox;
    }
    $categoryBox.append(Kanji.SELECTOR_TEMPLATE);

    var $kanjiSelector = $categoryBox.children().last('li');

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
	       Kanji._setKanjiSelector(kanji);
      });
    }).done(function(){
      Kanji._handleKanjiSelection();
      Kanji._handleSectionExpansion();
      Kanji._handleKanjiSearch();
      Kanji._handleStrokeToggle();
    });
  }
};
