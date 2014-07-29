'use strict';

var user = require('./user'),
    views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    followButtons = require('./followButtons'),
    FollowWidget = require('./FollowWidget'),
    metadata = require('./lib/metadata'),
    config = require('./config.js');

function FollowList(rootEl) {
	this.rootEl = rootEl;
  this.widget = null;
}

FollowList.prototype.init = function() {
  user.init();
  this.setupElements();
  if(user.following && user.following.entities) {
    this.setupButtons();
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoad', this.setupButtons.bind(this), false);
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

FollowList.prototype.setupElements = function() {
	this.list = views.list(this.rootEl);
  this.createMessage('Unable to initialise.', '');

  if(isWidget(this.rootEl)) {
    this.widget = new FollowWidget().init(this.list, this.rootEl);
  }


  // document.body.addEventListener('oFollow.serverError', this.onUpdateError.bind(this), false);
  // document.body.addEventListener('oFollow.updateSave', this.onUpdateSuccess.bind(this), false);


};

FollowList.prototype.setupButtons = function() {
  this.createButtons();
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

FollowList.prototype.createMessage = function(msg, type) {
  if(!this.message) {
    this.message = document.createElement('span');
    this.message.className = 'o-follow__message';

    this.list.insertBefore(this.message, this.list.querySelector('.o-follow__entity'));

  }
  this.message.innerText = msg;
  this.rootEl.setAttribute('data-o-follow-message', type);
};

FollowList.prototype.removeMessage = function(msg, type) {
  if(this.message) {
    this.message.parentElement.removeChild(this.message);
  }
  this.rootEl.removeAttribute('data-o-follow-message');
};

FollowList.prototype.createAllIn = function(rootEl, opts) {
  var followComponents = [], 
      fEls, 
      c, l, 
      list;

  rootEl = rootEl || document.body;
  //set config with overrides passed through
  config.set(opts);

  if (rootEl.querySelectorAll) {
    fEls = rootEl.querySelectorAll('[data-o-component=o-follow]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-follow--js')) {
        list = new FollowList(fEls[c]);
        list.init();
        followComponents.push(list);
      }
    }
  }

  return followComponents;
};

function isWidget(rootEl) {
  return rootEl.className.indexOf('o-follow--theme') >= 0;
}


FollowList.prototype.createButtons = function() {
  if(this.rootEl.hasAttribute('data-o-follow-article-id'))  {
    this.createForArticle();
  } else if (this.rootEl.hasAttribute('data-o-follow-user')) {
    this.createForUser();
  } else if (this.rootEl.hasAttribute('data-o-follow-entities')) {
    this.createForEntities();
  } else {
    this.setReadyIfListNotEmpty();
  }
};

//We've already initialised the user, so create buttons for ell the entities that they
//are already following
FollowList.prototype.createForUser = function() {
  var entities = user && user.following ? user.following.entities : [];
  renderButtonsForEntities(entities, this.list);
  this.setReadyIfListNotEmpty();
};

//Make an async call to get the metadata for the given article, and render buttons
//for the entities for that article
FollowList.prototype.createForArticle = function() {
  var self = this,
      articleId = this.rootEl.getAttribute('data-o-follow-article-id');

    metadata.get(articleId, function(entities) {
    renderButtonsForEntities(entities.authors, self.list);
    self.setReadyIfListNotEmpty();
    // Reset the button states now they have been created asynchronously
    followButtons.setInitialStates(self.list);
  });
};

FollowList.prototype.createForEntities = function() {
    var entities = JSON.parse(this.rootEl.getAttribute('data-o-follow-entities'));
      
    renderButtonsForEntities(entities, this.list);
    this.setReadyIfListNotEmpty();
};

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
}

FollowList.prototype.setReadyIfListNotEmpty = function() {
  //Only show the component if there are entities to follow
  if(this.list.querySelector('.o-follow__entity')) {
    eventHelper.dispatch('oFollow.show', null, this.rootEl);
    eventHelper.dispatch('oTracking.Event', { model: 'oFollow', type: 'show'}, window);
    this.removeMessage();
    this.rootEl.setAttribute('data-o-follow--js', '');
  }
};



module.exports = FollowList;