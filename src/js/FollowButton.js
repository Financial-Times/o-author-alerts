/*global require, module*/

'use strict';

var user = require('./user');

function FollowButton(btn) {

  this.el = btn;
  this.entity = {
    'id': btn.getAttribute('data-o-follow-id'),
    'name': btn.getAttribute('data-o-follow-name')
  };
  this.init();
}

FollowButton.prototype.init = function() {
  this.el.addEventListener('click', this.toggleFollowState.bind(this), false);
  this.setInitialState();
};

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

FollowButton.prototype.setInitialState = function() {
  if(isBeingFollowed(this.entity, user.following.entities)) {
    this.startFollowing();
  }
};

FollowButton.prototype.toggleFollowState = function() {
  var isCurrentlyFollowing = (this.el.getAttribute('data-o-follow-state') === 'true');

  if(isCurrentlyFollowing) {
    user.following.stop(this.entity, user.id );
    this.stopFollowing();
  } else {
    user.following.start(this.entity, user.id);
    this.startFollowing();
  }
};

FollowButton.prototype.startFollowing = function() {
  this.el.innerText = this.el.innerText.replace('Start', 'Stop');
  this.el.setAttribute('data-o-follow-state', true);
};

FollowButton.prototype.stopFollowing = function() {
  this.el.innerText = this.el.innerText.replace('Stop', 'Start');
  this.el.setAttribute('data-o-follow-state', false);
};


module.exports = FollowButton;


