'use strict';

var user = require('./user'),
    views = require('./views'),
    eventHelper = require('./lib/eventHelper'),
    buttons = require('./buttons'),
    message = require('./lib/message'),
    AlertsWidget = require('./AlertsWidget'),
    metadata = require('./lib/metadata'),
    config = require('./config.js');


function AuthorAlerts(rootEl) {
	this.rootEl = rootEl;
  this.widget = null;
  this.list = null;
}


AuthorAlerts.prototype = {

  init: function(opts) {

    config.set(opts);

    user.init(); //Ensures that a user is initialized

    this.createView();

    //Wait for the user's subscription data to be loaded
    // This ensures that the component shows the correct toggle states 
    if(user.subscription && user.subscription.entities) {
      this.setupAuthorButtons();
    } else {
      document.body.addEventListener('oAuthorAlerts.userPreferencesLoad', this.setupAuthorButtons.bind(this), false);
    }

  },

  destroy: function() {
    document.body.removeEventListener('oAuthorAlerts.userPreferencesLoad');
    user.destroy();
    buttons.destroy();
    if(this.widget) {
        this.widget.destroy();
    }
    this.rootEl.parentElement.removeChild(this.rootEl);
  },


  createView: function() {
    //Creates a basic list to display the authors
    this.list = views.list(this.rootEl);

    //If o-author-alerts__theme is present, wrap this list inside a widget/overlay
    if(isWidget(this.rootEl)) {
      this.widget = new AlertsWidget();
      this.widget.init(this.rootEl);
    }

    message.create(this.rootEl, 'Loading data...', '');

    //If lazyLoading metadata, show the widget immediately
    // Note: this means that the widget will still display if no authors found
    if(config.lazyLoad) {
      showComponent(this.rootEl);
    }

  },

  /* 
    Creates the controls for all the authors (based on data attributes provided)
    Optionally lazy loads the creation of these controls - to avoid multiple initial calls to fetch metadata
  */
  setupAuthorButtons: function() {
    var self = this,

        eventToLoadOn = ('onmouseover' in window) ? 'mouseover' : 'click', 
        
        initialiseButtons = function() {

          self.createButtons();

          buttons.init(self.rootEl);

          self.rootEl.removeEventListener(eventToLoadOn, initialiseButtons); //Only need this event to occur once

          if(self.widget && self.widget.widget) {
            self.widget.widget.removeEventListener('focus', initialiseButtons); 
          }

        };

    if(config.lazyLoad === true && isWidget(this.rootEl)) {
      //Lazy loading metadata on hover of widget
      // Can only lazy load widget view, since the controls are hidden in the overlay
      this.rootEl.addEventListener(eventToLoadOn, initialiseButtons, false);
      this.widget.widget.addEventListener('focus', initialiseButtons, false); 
    } else {
      initialiseButtons();
    }

  },



  createButtons: function() {
    if(this.rootEl.hasAttribute('data-o-author-alerts-article-id'))  {
      this.createForArticle();
    } else if (this.rootEl.hasAttribute('data-o-author-alerts-user')) {
      this.createForUser();
    } else if (this.rootEl.hasAttribute('data-o-author-alerts-entities')) {
      this.createForEntities();
    } else {
      this.handleEntityLoad();
    }
  },

  createForUser: function() {
    var entities = user && user.subscription ? user.subscription.entities : [];

    renderButtonsForEntities(entities, this.list);

    //Add an unfollow all button if they are already following something
    if(entities.length > 0) {
      views.standaloneButton(this.list, 'unsubscribe', 'Unsubscribe All');
    }
    this.handleEntityLoad();
  },

  createForArticle: function() {
    var self = this,
        articleId = this.rootEl.getAttribute('data-o-author-alerts-article-id');

      metadata.get(articleId, function(entities) {
        renderButtonsForEntities(entities.authors, self.list);
        self.handleEntityLoad();
        // Reset the button states now they have been created asynchronously
        buttons.setInitialStates(self.rootEl);
      });
  },

  createForEntities: function() {
      var entities = JSON.parse(this.rootEl.getAttribute('data-o-author-alerts-entities'));
        
      renderButtonsForEntities(entities, this.list);
      this.handleEntityLoad();
  },

  /* This is called when we know we have created the controls for all the authors
    
  */
  handleEntityLoad: function() {

    message.remove(this.rootEl);

    eventHelper.dispatch('oAuthorAlerts.entitiesLoaded', null, this.rootEl);

    if(!this.list.querySelector('.o-author-alerts__controls')) {
      message.create(this.rootEl,'No Authors found.', '');
    } else if (!config.lazyLoad) {
      // If we are not lazy loading, only show the component at this stage.
      // This stops the component being displayed if there are no authors to display
      showComponent(this.rootEl);
    }

  }


};

function isWidget(rootEl) {
  return rootEl.className.indexOf('o-author-alerts--theme') >= 0;
}

function renderButtonsForEntities(entities, list) {
  var i, l;
  for(i=0,l=entities.length; i< l; i++) {
    views.button(list, entities[i]);
  }
  if(entities.length > 0) {
    views.standaloneButton(list, 'save', 'Save', true); //Disabled save button by default
  }
}

function showComponent(rootEl) {
  rootEl.setAttribute('data-o-author-alerts--js', '');

  //send tracking events since the widget will be visible
  eventHelper.dispatch('oAuthorAlerts.show', null, rootEl);
  //Matching the tracking set by the old widget
  eventHelper.dispatch('oTracking.Data', {'followme': true }, window);

}


/* 
  Initialise all author alerts components within a container
  Optionally pass in configuration overrides 
 */
AuthorAlerts.init = function(rootEl, opts) {
  var components = [], 
      fEls, 
      c, l, 
      component;

  rootEl = rootEl || document.body;
  //set config with overrides passed through

  if (rootEl.querySelectorAll) {
    fEls = rootEl.querySelectorAll('[data-o-component=o-author-alerts]');
    for (c = 0, l = fEls.length; c < l; c++) {
      if (!fEls[c].hasAttribute('data-o-author-alerts--js')) {
        component = new AuthorAlerts(fEls[c]);
        component.init(opts);
        components.push(component);
      }
    }
  }

  return components;
};



module.exports = AuthorAlerts;