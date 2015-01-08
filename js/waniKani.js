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
    var $category         = $('.categoryBox[data-category="wanikani"] .category-content');
    var $subLevelTemplate = $(WaniKani.SUBLEVEL_TEMPLATE);
    var $subLevelTitle    = $subLevelTemplate.find('.subcategory-title');

    for(i=1; i<=userLevel; i++){
      $subLevelTemplate.attr('data-subcategory', i);
      $subLevelTitle.text('Level '+ i);
      $category.append($subLevelTemplate.clone());
    };
  },

  _hideUserForm: function() {
    var $waniKaniForm = $('.waniKaniContent');

    $waniKaniForm.hide();
  },

  _loadUser: function(apiKey) {
    $.ajax({
      url: 'https://www.wanikani.com/api/user/' + apiKey +  '/kanji/',
      type: 'GET',
      dataType: 'jsonp',

      error: function(xhr, status, error) {
          alert("error");
      },

      success: function(resp, status) {
        var userLevel = resp.user_information.level;
        var userKanji = resp.requested_information;

        WaniKani._setSubLevels(userLevel);
        WaniKani._setUserKanji(userKanji);
        WaniKani._hideUserForm();
        window.Kanji._handleSelectAll();
      }
    });
  },

  init: function() {
    WaniKani.handleLoadUserSubmit();
  }
}
