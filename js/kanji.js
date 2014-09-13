/*
 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 */
 function naturalSort (a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}

window.Kanji =  {

  SELECTOR_TEMPLATE:    $('#selectorTemplate').html().trim(),
  SUBCATEGORY_TEMPLATE: $('#subcategoryTemplate').html().trim(),
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
    var $kanjiSelector = $(Kanji.SELECTOR_TEMPLATE);
	
    if (kanji.hasOwnProperty('subcategory')) {
      var $subcategoryBox = $categoryBox.find('[data-subcategory="'+ kanji.subcategory + '"]');

      if ($subcategoryBox.size() == 0) {
        var $subcategoryArray = $categoryBox.find('.subcategory');
        var $newSubcategoryBox = $(Kanji.SUBCATEGORY_TEMPLATE.replace(/SUBCATEGORY/g, kanji.subcategory));
        var cnt = $subcategoryArray.length;
        var idx = 0;
        
        for (; idx < cnt; idx++) {
          if (naturalSort(kanji.subcategory, $subcategoryArray[idx].textContent) < 0) {
            $newSubcategoryBox.insertBefore($subcategoryArray[idx].parentElement);
            break;
          }
        }
        if (idx >= cnt) {
          $categoryBox.append($newSubcategoryBox);
        }
		$subcategoryBox = $newSubcategoryBox;

		$subcategoryBox.children('.subcategory').on('click', function(ev) {
          var $kanji = $(this).siblings('.kanji-box');
		  test = $kanji;
		  for (var idx = $kanji.length; idx >= 0; idx--) {
		    Kanji._selectKanji($(test[idx]));
		  }
		});
      }

      $categoryBox = $subcategoryBox;
    }
    $categoryBox.append($kanjiSelector);

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
