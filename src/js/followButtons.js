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
      i, l, btn;

  for(i=0,l=buttons.length; i<l;i++) {
    btn = buttons[i];
    if(isBeingFollowed(btn.getAttribute('data-o-follow-id'), user.following.entities)) {
      startFollowing(btn);
    } else {
      stopFollowing(btn);
    }
  }
}

function isBeingFollowed(id, followingList) {
  var matched = false,
      i, l;
  followingList = followingList || [];

  for(i=0,l=followingList.length;i<l;i++) {
    if(followingList[i].id === id) {
      matched = true;
      break;
    }
  }

  return matched;
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
    stopFollowing(btn);
    eventName = 'stopFollowing';
  } else {
    user.following.start(entity, user.id);
    startFollowing(btn);
    eventName = 'startFollowing';
  }

  eventHelper.dispatch('oTracking.Event', { model: 'oFollow', type: eventName, value: entity.id}, window);
}

function startFollowing(el) {
  var name = el.getAttribute('data-o-follow-name');
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  setTextContent(el, config.stopFollowingText.replace(/\%entityName\%/g, name));
  el.setAttribute('data-o-follow-state', true);
}

function stopFollowing(el) {
  var name = el.getAttribute('data-o-follow-name');
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


