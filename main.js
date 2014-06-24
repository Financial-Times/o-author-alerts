var FollowButton = require('./src/js/FollowButton');
var user = require('./src/js/user');

//TODO: move this somewhere better!
user.init();


exports.createAllIn = function(el){
	var followButtons = [], fEls, c, l;
  el = el || document.body;
  if (el.querySelectorAll) {
      fEls = el.querySelectorAll('[data-o-component=o-follow]');
      for (c = 0, l = fEls.length; c < l; c++) {
          if (!fEls[c].classList.contains('o-follow--js')) {
              createButtons(fEls[c]);
          }
      }
  }
  return followButtons;
};

function createButtons(el) {
  if(el.hasAttribute('data-o-follow-entity')) {
    createForEntity(el, JSON.parse(el.getAttribute('data-o-follow-entity')));
  } else if(el.hasAttribute('data-o-follow-article-id'))  {
    createForArticle(el, el.getAttribute('data-o-follow-article-id') );
  } else if (el.hasAttribute('data-o-follow-user')) {
    if(user.following && user.following.length) {
      createForUser(el);
    } else {
      document.body.addEventListener('oFollow.userPreferencesLoaded', function() {
        createForUser(el);
      }, false);
    }
  }
}

function createForUser(el) {
  user.following.forEach(function(entity) {
    new FollowButton(el, entity);
  });
}

function createForArticle(el, articleId) {
  var metadata = require('./src/js/lib/metadata');
  metadata.get(articleId, function(entities) {
    entities.authors.forEach(function(entity) {
      new FollowButton(el, entity);
    });
  });
}

function createForEntity(el, entity) {
  new FollowButton(el, entity);
}
