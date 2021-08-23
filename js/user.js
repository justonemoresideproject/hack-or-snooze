"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

async function addFavorites(story) {
  currentUser.favorites.push(story);
  const token = currentUser.loginToken;
    await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
      method: "post",
      data: { token },
    });
}

async function removeFavorites(story) {
  currentUser.favorites = currentUser.favorites.filter(s => s.storyId !== story.storyId);
  console.log(story.storyId)
  const token = currentUser.loginToken;
  await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
    method: "delete",
    data: { token },
  });
  removeFavoritesOnFavArea(story.storyId)
};

function removeFavoritesOnFavArea(storyId){
  for(let story of $favStoryArea[0].childNodes){
    if(storyId == story.id){
      console.log('storyId')
      story.remove();
    }
  }
}

function generateFavoritesMarkup(story) {
  const hostName = story.getHostName();
  return $(
     `<li id="${story.storyId}">
        <small class="unfilledStar">&star;</small>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>`
      );
}

function putFavoritesOnPage() {
  console.debug("putStoriesOnPage");

  $favStoryArea.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateFavoritesMarkup(story);
    $favStoryArea.append($story);
  }
}

// add  or remove favorites by pressing star
$allStoriesList.on('click', (evt) => {
  const e = evt.target.className
  // console.log(evt.target.parentNode.id)

  // changes color of star from unfilled to orange and adds story to favorites
  if(e == 'unfilledStar') {
    for(let story of storyList.stories){
      if(story.storyId == evt.target.parentNode.id){
        addFavorites(story)
        putFavoritesOnPage();
        console.log('added to favorites')
      }
    }
    evt.target.innerHTML = '&starf;'
    evt.target.className = 'filledStar'

    // changes color of star from orange to unfilled and removes story from favorites
  } else if(e == 'filledStar') {
    for(let favorite of currentUser.favorites){
      if(favorite.storyId == evt.target.parentNode.id){
        removeFavorites(favorite)
        console.log('removed from favorites')
      }
    }
    evt.target.innerHTML = '&star;'
    evt.target.className = 'unfilledStar'
  }
})

// { storyId, title, author, url, username, createdAt }

// function test() {
//   for(let story of storyList.stories){
//     if(story.storyId == 'ca7be56c-e663-4cf6-bcf0-c53f7f7d6f2e') {
//       console.log(story)
//     }
//   }
// }