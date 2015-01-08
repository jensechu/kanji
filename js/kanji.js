window.Kanji =  {

  SELECTOR_TEMPLATE:    $('#selectorTemplate').html().trim(),
  KANJI_TEMPLATE:       $('#kanjiTemplate').html().trim(),
  SUBCATEGORY_TEMPLATE: $('#subCategoryTemplate').html().trim(),
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
    });
  },

  sectionExpansion: function($selectedCategory) {
    Kanji.$category.siblings('.category-content').removeClass('expand');
    Kanji.$category.siblings('.category-select-all').hide();
    Kanji.$category.siblings('.category-deselect-all').hide();
    $selectedCategory.siblings('.category-content').addClass('expand');
    $selectedCategory.siblings('.category-select-all').show();
    $selectedCategory.siblings('.category-deselect-all').show();
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

  _initialSelectAllHide: function() {
    $(".category-select-all").each(function() {
      $(this).hide();
    });
    $(".category-deselect-all").each(function() {
      $(this).hide();
    });
    $(".category-select-all-show").each(function() {
      $(this).show();
    });
  },

  __selectClicker: function() {
    if (!$(this).hasClass('selected')) {
      $(this).trigger("click");
    }
  },

  __deselectClicker: function() {
    if ($(this).hasClass('selected')) {
      $(this).trigger("click");
    }
  },

  _handleSelectAll: function() {
    $(".category-select-all,.category-deselect-all").off("click"); // remove previous event handlers

    $(".category-select-all").on('click', function() {
      $(this).siblings(".category-content").children(".kanji-box").each(Kanji.__selectClicker);
      $(this).siblings(".kanji-box").each(Kanji.__selectClicker);
      $(this).removeClass("category-select-all");
      $(this).addClass("category-deselect-all");
      $(this).children("a").html("De-select All");
      Kanji._handleSelectAll(); // need to readd event handlers
    });

    $(".category-deselect-all").on('click', function() {
      $(this).siblings(".category-content").children(".kanji-box").each(Kanji.__deselectClicker);
      $(this).siblings(".kanji-box").each(Kanji.__deselectClicker);
      $(this).removeClass("category-deselect-all");
      $(this).addClass("category-select-all");
      $(this).children("a").html("Select All");
      Kanji._handleSelectAll(); // need to readd event handlers
    });
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
      Kanji._handleSelectAll();
      Kanji._initialSelectAllHide();
    });
  }
};
