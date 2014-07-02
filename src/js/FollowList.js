'use strict';

var user = require('./user'),
    views = require('./views'),
    followButtons = require('./followButtons'),
    FollowWidget = require('./FollowWidget'),
    metadata = require('./lib/metadata');


function FollowList(rootEl) {
	this.rootEl = rootEl;
}

FollowList.prototype.init = function() {
  user.init();

  if(user.following && user.following.entities) {
    this.setup();
  } else {
    document.body.addEventListener('oFollow.ready', this.setup.bind(this), false);
  }
};

FollowList.prototype.destroy = function() {
  document.body.removeEventListener('oFollow.ready');
  user.destroy();
  this.rootEl.parentElement.removeChild(this.rootEl);
};

FollowList.prototype.setup = function() {
	var list = views.list(this.rootEl);

	createButtons(this.rootEl, list);

  if(this.rootEl.hasAttribute('data-o-follow-widget')) {
    new FollowWidget(list);
  }

  followButtons.init(list);

};

FollowList.prototype.createAllIn = function(rootEl) {
  var followButtons = [], 
      fEls, 
      c, l, 
      btn;

  rootEl = rootEl || document.body;

  if (rootEl.querySelectorAll) {
    fEls = rootEl.querySelectorAll('[data-o-component=o-follow]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-follow--js')) {
        btn = new FollowList(fEls[c]);
        btn.init();
        followButtons.push(btn);
      }
    }
  }

  return followButtons;
};


function createButtons(rootEl, list) {
  if(rootEl.hasAttribute('data-o-follow-article-id'))  {
    createForArticle(list, rootEl.getAttribute('data-o-follow-article-id'));
  } else if (rootEl.hasAttribute('data-o-follow-user')) {
    createForUser(list);
  } else {
    setReadyIfListNotEmpty(list);
  }
}


function createForUser(list) {
  var entities = user && user.following ? user.following.entities : [];
  renderButtonsForEntities(entities, list);
}

function createForArticle(list, articleId) {
  metadata.get(articleId, function(entities) {
    renderButtonsForEntities(entities, list);
    followButtons.setButtonStates(list);
  });
}

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
  setReadyIfListNotEmpty(list);
}

function setReadyIfListNotEmpty(list) {
  var rootEl = list.parentElement;
  if(list.hasChildNodes()) {
    rootEl.setAttribute('data-o-follow--js', '');
  }
}

module.exports = FollowList;