window.WaniKani = {

  SUBLEVEL_TEMPLATE: $('#subCategoryTemplate').html().trim(),

  handleLoadUserSubmit: function() {
    var $waniKaniSubmit = $('.submitWaniKaniUser');

    $waniKaniSubmit.on('click', function() {
      var apiKey = $('.inputWaniKaniUser').val().trim();

      WaniKani._loadUser(apiKey);
    });
  },

  _setUserKanji: function(userKanji) {
    var $selectedCategory = $('.categoryBox[data-category="wanikani"] h2');

    $.each(userKanji, function(i, kanji) {
      kanji['category']    = 'wanikani';
      kanji['subCategory'] = kanji.level;

      window.Kanji._setKanjiCategory(kanji);
    });

    window.Kanji.sectionExpansion($selectedCategory);
  },

  _setSubLevels: function(userLevel) {
    var $category = $('.categoryBox[data-category="wanikani"] .category-content');

    for(i=1; i<=userLevel; i++){
      var $subLevelTemplate = $(WaniKani.SUBLEVEL_TEMPLATE);
      var $subLevelTitle    = $subLevelTemplate.find('.subcategory-title');

      $subLevelTemplate.attr('data-subcategory', i);
      $subLevelTitle.prepend('Level '+ i);
      $category.append($subLevelTemplate);
    };

//    Kanji._handleKanjiSelection();
  },

  _hideUserForm: function() {
    var $waniKaniForm = $('.waniKaniContent');

    $waniKaniForm.hide();
  },

  _loadUser: function(apiKey) {
    WaniKani._getUserLevel(apiKey, function(userLevel) {
      WaniKani._getUserKanji(apiKey, userLevel, function(userKanji) {
        console.log(userKanji);
        WaniKani._setSubLevels(userLevel);
        WaniKani._setUserKanji(userKanji);
        WaniKani._hideUserForm();
      });
    });
  },

  // Gets the kanji from the user's current level and below
  _getUserKanji: function(apiKey, userLevel, callback) {
    // Create a string array of all of the user's completed levels
    // in the form 'n,n-1,...,2,1' e.g. '5,4,3,2,1'
    var userLevels = '';
    for (var level = userLevel; level > 1; --level)
      userLevels += level + ',';
    userLevels += '1';
    
    WaniKani._accumulateUserKanji(
      apiKey,
      'https://api.wanikani.com/v2/subjects?levels=' + userLevels + '&types=kanji',
      [],
      callback
    );
  },

  // Accumulates paginated kanji results from WaniKani API.
  // This is a helper function used by WaniKani._getUserKanji().
  _accumulateUserKanji: function(apiKey, url, accumulated, callback) {
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      headers: {
        'Wanikani-Revision': '20170710',
        'Authorization': 'Bearer ' + apiKey,
      },

      error: function(xhr, status, error) {
        alert("error");
      },

      success: function(resp, status) {
        // Extend the accumulated array with the kanji found on this page
        accumulated = accumulated.concat(resp.data.map(function(kanji) {
          var kanjiInfo = kanji.data;

          return {
            level: kanjiInfo.level,
            character: kanjiInfo.characters,
            onyomi: kanjiInfo.readings
              .filter(reading => reading.type == 'onyomi')
              // ensure primary readings come first
              .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
              .map(reading => reading.reading)
              .join(' '),
            kunyomi: kanjiInfo.readings
              .filter(reading => reading.type == 'kunyomi')
              .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
              .map(reading => reading.reading)
              .join(' '),
            meaning: kanjiInfo.meanings
              // ensure primary meanings come first
              .sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0)
              .map(meaning => meaning.meaning.toLowerCase())
              .join(', '),
          };
        }));

        if (resp.pages.next_url)
          WaniKani._accumulateUserKanji(apiKey, resp.pages.next_url, accumulated, callback);
        else
          callback(accumulated);
      }
    });
  },

  // Gets the level of the user, calling the callback with the result.
  _getUserLevel: function(apiKey, callback) {
    $.ajax({
      url: 'https://api.wanikani.com/v2/user',
      type: 'GET',
      dataType: 'json',
      headers: {
        'Wanikani-Revision': '20170710',
        'Authorization': 'Bearer ' + apiKey,
      },

      error: function(xhr, status, error) {
        alert("error");
      },

      success: function(resp, status) {
        callback(resp.data.level);
      }
    });
  },

  init: function() {
    WaniKani.handleLoadUserSubmit();
  }
}
