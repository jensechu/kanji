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

//      window.Kanji._setKanjiSelector(kanji);
        window.Kanji._setKanjiCategory(kanji);
    });

    window.Kanji.sectionExpansion($selectedCategory);
  },

  _setSubLevels: function(userLevel) {
    $category         = $('.categoryBox[data-category="wanikani"]');
    $subLevelTemplate = $(WaniKani.SUBLEVEL_TEMPLATE);

    console.log(userLevel);

    for(i=1; i<userLevel; i++){
      $subLevelTemplate.attr('data-subcategory', i);
      $category.append($subLevelTemplate);
    };
  },

  _hideUserForm: function() {
    var $waniKaniForm = $('.waniKaniContent');

    $waniKaniForm.hide();
  },

  _loadUser: function(apiKey) {
    $.ajax({
      url: 'https://www.wanikani.com/api/user/2c513c485c89382ec519382cd45e7ee9/kanji/',
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
      }
    });
  },

  init: function() {
    WaniKani.handleLoadUserSubmit();
  }
}
