/*global require, module*/

'use strict';

var user = require('./user'),
    eventHelper = require('./lib/eventHelper'),
    DomDelegate = require('ftdomdelegate'),
    rootDelegate;

function init(rootEl) {
  rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-follow-id]', function(ev) {
    toggleFollowState(ev, rootEl);
  });
  setButtonStates(rootEl);
}

function destroy() {
  if(rootDelegate) {
    rootDelegate.off();
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

function setButtonStates(rootEl) {
  var buttons = rootEl.querySelectorAll('[data-o-follow-id]'),
      i, l;

  for(i=0,l=buttons.length; i<l;i++) {
    setInitialState(buttons[i]);
  }
}

function setInitialState(btn) {
  if(isBeingFollowed(btn.getAttribute('data-o-follow-id'), user.following.entities)) {
    startFollowing(btn);
  }
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
    eventName = 'oFollow.stopFollowing';
  } else {
    user.following.start(entity, user.id);
    startFollowing(btn);
    eventName = 'oFollow.startFollowing';
  }

  eventHelper.dispatch(eventName, {
    entity: entity,
    userId: user.id
  }, rootEl);
}


function startFollowing(el) {
  //note: using innerHTML in second instance since element is hidden so innerText returns ''
  el.innerText = el.innerHTML.replace('Start', 'Stop');
  el.setAttribute('data-o-follow-state', true);

}

function stopFollowing(el) {
  el.innerText = el.innerHTML.replace('Stop', 'Start');
  el.setAttribute('data-o-follow-state', false);

}

module.exports = {
  init: init,
  destroy: destroy,
  setButtonStates: setButtonStates
};


