const Helpers = {
  convertRatingToString: function (chatRating: number | null) {
    if (chatRating == null) {
      return "Unrated";
    } else if (chatRating == 1) {
      return "Liked";
    } else if (chatRating == -1) {
      return "Disliked";
    }
  },
};

export default Helpers;
