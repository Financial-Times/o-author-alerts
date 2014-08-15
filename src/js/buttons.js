/*global require, module*/

'use strict';

var user = require('./user'),
    eventHelper = require('./lib/eventHelper'),
    config = require('./config.js'),
    DomDelegate = require('ftdomdelegate'),
    rootDelegate;

//initialise all buttons in the rootEl
function init(rootEl) {
  rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-author-alerts-id]', function(ev) {
    toggleAlertState(ev.target);
  });

  rootDelegate.on('click', '[data-o-author-alerts-all="unsubscribe"]', function(ev) {
    stopAll(ev, rootEl);
  });

  setInitialStates(rootEl);
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
  }
}


function setInitialStates(rootEl) {
  var buttons = rootEl.querySelectorAll('[data-o-author-alerts-id]'),
      i, l, btn, id;

  for(i=0,l=buttons.length; i<l;i++) {
    btn = buttons[i];
    id = btn.getAttribute('data-o-author-alerts-id');
    if(isSubscribed(id, user.subscription.entities)) {
      subscribe(btn);
    } else {
      unsubscribe(btn);
    }
  }
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

function toggleAlertState(btn) {
  var isSubscribed = (btn.getAttribute('data-o-author-alerts-state') === 'true'),
      entity = {
        'id': btn.getAttribute('data-o-author-alerts-id'),
        'name': btn.getAttribute('data-o-author-alerts-name')
      },
      eventName;
  if(isSubscribed) {
    user.subscription.stop(entity, user.id );
    unsubscribe(btn);
    eventName = 'unfollow'; //Old name for tracking purposes
  } else {
    user.subscription.start(entity, user.id);
    subscribe(btn);
    eventName = 'follow'; //Old name for tracking purposes
  }

  eventHelper.dispatch('oTracking.Event', { model: 'followme', type: eventName, value: entity.name}, window);
}

function subscribe(el) {
  var name = el.getAttribute('data-o-author-alerts-name');
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  el.innerHTML = config.stopAlertsText.replace(/\%entityName\%/g, name);
  el.setAttribute('data-o-author-alerts-state', true);
  el.setAttribute('title', 'Click to stop alerts for this ' + config.entityType);
}

function unsubscribe(el) {
  var name = el.getAttribute('data-o-author-alerts-name');
  setTextContent(el, config.startAlertsText.replace(/\%entityName\%/g, name));
  el.setAttribute('data-o-author-alerts-state', false);
  el.setAttribute('title', 'Click to start alerts for this ' + config.entityType);

}

function stopAll(ev, rootEl) {
  var buttons = rootEl.querySelectorAll('[data-o-author-alerts-state="true"]'),
      i, l;
  for(i=0,l=buttons.length;i<l;i++) {
    toggleAlertState(buttons[i]);
  }
  ev.target.setAttribute('disabled', true);
}

function setTextContent(element, text) {
  if('textContent' in element) {
    element.textContent = text;
  } else {
    element.innerText = text;
  }
}

module.exports = {
  init: init,
  destroy: destroy,
  setInitialStates: setInitialStates
};


