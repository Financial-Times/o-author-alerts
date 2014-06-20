'use strict';

var follow = require('./follow');
var user = require('./user');
var _ = require('lodash');

function FollowButton(rootEl) {
	this.rootEl = rootEl;
  this.btn = rootEl.querySelector('[data-o-follow-id]');;
  this.entity = {
    id: this.btn.getAttribute('data-o-follow-id'),
    name: this.btn.getAttribute('data-o-follow-name')
  }
	this.init();
}

FollowButton.prototype.init = function() {
  this.btn.addEventListener('click', this.toggleFollowState.bind(this), false);
  document.body.addEventListener('oFollow.userPreferencesLoaded', this.setInitialState.bind(this), false);
}

FollowButton.prototype.setInitialState = function(ev) {
  if(isBeingFollowed(this.entity, ev.detail.following)) {
    this.setStateToStop();
  }
}

function isBeingFollowed(entity, followingList) {
  var matched = false;
  followingList.forEach(function(following) {
    if(following.id === entity.id) {
      matched = true;
      return;
    }
  });
  return matched;
}

FollowButton.prototype.toggleFollowState = function(ev) {
  var isCurrentlyFollowing = this.rootEl.getAttribute('data-o-follow-state');
  if(isCurrentlyFollowing) {
    follow.stop(this.entity, user.id )
    this.setStateToStart();
  } else {
    follow.start(this.entity, user.id);
    this.setStateToStop();
  }
}   

FollowButton.prototype.setStateToStart = function() {
  this.btn.innerText = "Start Following";
  this.rootEl.setAttribute('data-o-follow-state', true);
}

FollowButton.prototype.setStateToStop = function() {
  this.btn.innerText = "Stop Following";
  this.rootEl.setAttribute('data-o-follow-state', false);
}


FollowButton.prototype.createAllIn = function(el){
	var followButtons = [], fEls, c, l;
  el = el || document.body;
  if (el.querySelectorAll) {
      fEls = el.querySelectorAll('[data-o-component=o-follow]');
      for (c = 0, l = fEls.length; c < l; c++) {
          if (!fEls[c].classList.contains('o-follow--js')) {
              followButtons.push(new FollowButton(fEls[c]));
          }
      }
  }
  return followButtons;
};


module.exports = FollowButton;