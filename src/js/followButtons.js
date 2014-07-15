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
  rootDelegate.on('click', '[data-o-follow-id]', function(ev) {
    toggleFollowState(ev, rootEl);
  });
  setInitialStates(rootEl);
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
  }
}


function setInitialStates(rootEl) {
  var buttons = rootEl.querySelectorAll('[data-o-follow-id]'),
      i, l, btn, entityBeingFollowed;

  for(i=0,l=buttons.length; i<l;i++) {
    btn = buttons[i];
    entityBeingFollowed = isBeingFollowed(btn.getAttribute('data-o-follow-id'), user.following.entities);
    if(entityBeingFollowed) {
      startFollowing(btn, entityBeingFollowed.name);
    }
  }
}

function isBeingFollowed(id, followingList) {
  var entity = null,
      i, l;
  followingList = followingList || [];

  for(i=0,l=followingList.length;i<l;i++) {
    if(followingList[i].id === id) {
      entity = followingList[i];
      break;
    }
  }

  return entity;
}

function toggleFollowState(ev, rootEl) {
  var btn = ev.target,
      isCurrentlyFollowing = (btn.getAttribute('data-o-follow-state') === 'true'),
      entity = {
        'id': btn.getAttribute('data-o-follow-id'),
        'name': btn.getAttribute('data-o-follow-name')
      },
      eventName;

  if(isCurrentlyFollowing) {
    user.following.stop(entity, user.id );
    stopFollowing(btn, entity.name);
    eventName = 'stopFollowing';
  } else {
    user.following.start(entity, user.id);
    startFollowing(btn, entity.name);
    eventName = 'startFollowing';
  }

  eventHelper.dispatch('oTracking.Event', { model: 'oFollow', type: eventName, value: entity.id}, window);
}

function startFollowing(el, name) {
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  setTextContent(el, config.stopFollowingText.replace(/\%entityName\%/g, name));
  el.setAttribute('data-o-follow-state', true);
}

function stopFollowing(el, name) {
  setTextContent(el, config.startFollowingText.replace(/\%entityName\%/g, name));
  el.setAttribute('data-o-follow-state', false);

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


