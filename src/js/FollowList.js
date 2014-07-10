'use strict';

var user = require('./user'),
    views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    followButtons = require('./followButtons'),
    FollowWidget = require('./FollowWidget'),
    metadata = require('./lib/metadata');

function FollowList(rootEl) {
	this.rootEl = rootEl;
  this.widget = null;
  this.message = null;
}

FollowList.prototype.init = function() {
  user.init();

  if(user.following && user.following.entities) {
    this.setup();
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoad', this.setup.bind(this), false);
  }
};

FollowList.prototype.destroy = function() {
  document.body.removeEventListener('oFollow.userPreferencesLoad');
  user.destroy();
  followButtons.destroy();
  if(this.widget) {
      this.widget.destroy();
  }
  this.rootEl.parentElement.removeChild(this.rootEl);
};

FollowList.prototype.setup = function() {
	this.list = views.list(this.rootEl);

	createButtons( this.list, this.rootEl);

  if(isWidget(this.rootEl)) {
    this.widget = new FollowWidget().init(this.list, this.rootEl);
  }

  
  // document.body.addEventListener('oFollow.serverError', this.onUpdateError.bind(this), false);
  // document.body.addEventListener('oFollow.updateSave', this.onUpdateSuccess.bind(this), false);

  followButtons.init(this.list);

};

//NOT IMPLEMENTED YET
// FollowList.prototype.onUpdateError = function() {
//   this.createMessage('There was a problem saving your preferences. We\'ll try again when you next visit an article.', 'error');
// };

// FollowList.prototype.onUpdateSuccess = function() {
//   if(this.message && this.message.className.indexOf('error')) {
//     this.createMessage('Preferences successfully synced to server!', 'success');
//   }
// };

// FollowList.prototype.createMessage = function(msg, type) {
//   if(!this.message) {
//     this.message = document.createElement('span');
//     this.message.className = 'o-follow__message';

//     this.list.insertBefore(this.message, this.list.querySelector('.o-follow__entity'));

//   }
//   this.message.innerText = msg;
//   this.rootEl.setAttribute('data-o-follow-message', type);
// };

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

function isWidget(rootEl) {
  return rootEl.querySelector('.o-follow__widget') && rootEl.className.indexOf('o-follow--theme') >= 0;
}
function createButtons(list, rootEl) {
  if(rootEl.hasAttribute('data-o-follow-article-id'))  {
    createForArticle(list, rootEl);
  } else if (rootEl.hasAttribute('data-o-follow-user')) {
    createForUser(list, rootEl);
  } else {
    setReadyIfListNotEmpty(list, rootEl);
  }
}

function createForUser(list, rootEl) {
  var entities = user && user.following ? user.following.entities : [];
  renderButtonsForEntities(entities, list);
  setReadyIfListNotEmpty(list, rootEl);
}

function createForArticle(list, rootEl) {
  var articleId = rootEl.getAttribute('data-o-follow-article-id');
  metadata.get(articleId, function(entities) {
    renderButtonsForEntities(entities.authors, list);
    setReadyIfListNotEmpty(list, rootEl);
    followButtons.setButtonStates(list);
  });
}

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
}

function setReadyIfListNotEmpty(list, rootEl) {
  if(list.querySelector('.o-follow__entity')) {
    rootEl.setAttribute('data-o-follow--js', '');
    eventHelper.dispatch('oFollow.show', null, rootEl);
    eventHelper.dispatch('oTracking.Event', { model: 'oFollow', type: 'show'}, window);
  }
}



module.exports = FollowList;