/*global require, module*/

'use strict';

var user = require('./user'),
    eventHelper = require('./lib/eventHelper'),
    config = require('./config.js'),
    message = require('./lib/message'),
    DomDelegate = require('ftdomdelegate'),
    rootDelegate;

//initialise all buttons in the rootEl
function init(rootEl) {
  rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-author-alerts-id] > .o-author-alerts__button', function(ev, el) {
    toggleAlertState(el);
  });

  rootDelegate.on('click', '[data-o-author-alerts-all="unsubscribe"]', function(ev, el) {
    stopAll(el, rootEl);
  });

  setInitialStates(rootEl);
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
  }
}


function setInitialStates(rootEl) {
  // var entityControls = rootEl.querySelectorAll('[data-o-author-alerts-id]'),
  //     i, l, entity, id;

  // for(i=0,l=entityControls.length; i<l;i++) {
  //   entity = entityControls[i];
  //   id = entity.getAttribute('data-o-author-alerts-id');
  //   if(isSubscribed(id, user.subscription.entities)) {
  //     subscribe(entity);
  //   } else {
  //     unsubscribe(entity);
  //   }
  // }
}

function isSubscribed(id, subscriptionList) {
  var matched = false,
      i, l;
  subscriptionList = subscriptionList || [];

  for(i=0,l=subscriptionList.length;i<l;i++) {
    if(subscriptionList[i].id === id) {
      matched = true;
      break;
    }
  }

  return matched;
}

function toggleAlertState(btnClicked) {
  var controls = btnClicked.parentElement,
      entity = {
        'id': controls.getAttribute('data-o-author-alerts-id'),
        'name': controls.getAttribute('data-o-author-alerts-name'),
        'state': btnClicked.getAttribute('data-o-author-alerts-toggle') 
      },
      eventName;
  selectBtn(btnClicked);
  user.subscription.update(entity, user.id)
  // if(ent) {
  //   user.subscription.stop(entity, user.id );
  //   eventName = 'unfollow'; //Old name for tracking purposes
  // } else {
  //   user.subscription.start(entity, user.id);
  //   eventName = 'follow'; //Old name for tracking purposes
  // }

  eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: entity.name}, window);
}

function selectBtn(btnClicked) {
  var controls = btnClicked.parentElement;
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  controls.setAttribute('data-o-author-alerts-state', true);
  controls.querySelector('[aria-selected="true"').setAttribute('aria-selected', false);
  btnClicked.setAttribute('aria-selected', true);

}

function stopAll(el, rootEl) {
  var subscribed = rootEl.querySelectorAll('[data-o-author-alerts-state="true"]'),
      i, l;

  message.create(rootEl, 'You have been unsubscribed from all authors.', '');

  for(i=0,l=subscribed.length;i<l;i++) {
    toggleAlertState(subscribed[i]);
  }

  el.setAttribute('disabled', true);
}

module.exports = {
  init: init,
  destroy: destroy,
  setInitialStates: setInitialStates
};


