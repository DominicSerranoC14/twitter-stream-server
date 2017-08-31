'use strict';

module.exports = (status) => {
    const { user, text, extended_tweet, entities, in_reply_to_screen_name, id_str } = status;
    const { name, screen_name, profile_image_url } = user;
    // Determine if a tweet has extended text
    const displayText = (extended_tweet) ? extended_tweet.full_text : text;
    const media = (entities.media) ? entities.media : null;
    const reply_name = (in_reply_to_screen_name) ? in_reply_to_screen_name : null;

    return {
        status_id: id_str, name, screen_name,
        profile_image_url, displayText,
        media, reply_name,
    };
};
