"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

//  &star;
//  &starf;
 

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  // added unfilled star to each story
  const hostName = story.getHostName();
  if(currentUser == undefined){
    return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  } else {
    return $(`
      <li id="${story.storyId}">
        <a href="#" class="unfilledStar">&star;</a>
        <a href="#" class="trashCan" id=${story.storyId}>&#128465;</a>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Adding Story
$addStoryArea.on('submit', function(evt) {
  evt.preventDefault();
  const title = $addStoryTitle.value();
  const url = $addStoryURL.value();
  const author = $addStoryAuthor.value();

  storyList.addStory(currentUser, { title: title, author: author, url: url });

  $addStoryTitle.clear();
  $addStoryURL.clear();
  $addStoryAuthor.clear();
})

// Deleting Story, only available to logged in users
$allStoriesList.on('click', function(evt) {
  evt.preventDefault();
  for(let story of $allStoriesList[0].childNodes){
    if(story.id == evt.target.id) {
      removeStory(story.id)
      if(containsFavorite(story.id)){
        removeFavoritesOnFavArea(story.id)
      }
    }
  }
})

function removeStory(storyId) {
  for(let story of $allStoriesList[0].childNodes){
    if(storyId == story.id){
      // console.log('storyId')
      story.remove();
    }
  }
}