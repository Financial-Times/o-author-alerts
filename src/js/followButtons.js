/*global require, module*/

'use strict';

var user = require('./user'),
    DomDelegate = require('ftdomdelegate');

function init(rootEl) {
  var rootDelegate = new DomDelegate(rootEl);
  rootDelegate.on('click', '[data-o-follow-id]', toggleFollowState);
  setButtonStates(rootEl);
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

function toggleFollowState(ev) {
  var btn = ev.target,
      isCurrentlyFollowing = (btn.getAttribute('data-o-follow-state') === 'true'),
      entity = {
        'id': btn.getAttribute('data-o-follow-id'),
        'name': btn.getAttribute('data-o-follow-name')
      };

  if(isCurrentlyFollowing) {
    user.following.stop(entity, user.id );
    stopFollowing(btn);
  } else {
    user.following.start(entity, user.id);
    startFollowing(btn);
  }
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
  setButtonStates: setButtonStates
};


