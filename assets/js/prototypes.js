Date.prototype.getMonthName = function() {
  var months = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[this.getMonth()];
};
Date.prototype.getDayName = function() {
  let day = this.getDate();
  let suffix = '';
  if(day > 3 && day < 21) {
    suffix = 'th';
  } else switch (day % 10) {
    case 1: suffix = 'st'; break;
    case 2: suffix = 'nd'; break;
    case 3: suffix = 'rd'; break;
    default: suffix = 'th';
  }
  return day + suffix;
};
