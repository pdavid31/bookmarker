const os = require('os');
const path = require('path');
const fs = require('fs');
const {shell} = require('electron');

const folder = path.join(os.homedir(), '.bookmarker');

const file = path.join(folder, 'bookmarks.json');

// document on ready function
$(document).ready(() => {
  if (!fs.existsSync(folder)) {
    fs.mkdir(folder, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  readF(updateCollection);

  fs.watch(file, (eventType) => {
    if (eventType === 'change') {
      readF(updateCollection);
    }
  });

  // trigger modal
  $('.modal-trigger').click(function() {
    $('#bookmark_name').val('').removeClass('invalid');
    $('#bookmark_url').val('').removeClass('invalid');
    $('#modalAdd').modal();
  });

  // submit form
  $('#add').submit(function(e) {
    e.preventDefault();

    checkFS();

    // get form values and reset validity
    let bookmarkName = $('#bookmark_name').removeClass('invalid').val(),
      bookmarkURL = $('#bookmark_url').removeClass('invalid').val();

    if (!validateForm(bookmarkName, bookmarkURL)) {
      return false;
    }

    readF(data => {
      let temp = [];
      if (data.length > 0) {
        temp = JSON.parse(data);
      }

      let bookmark = {
        name: bookmarkName,
        url: bookmarkURL
      };

      temp.push(bookmark);

      // sort by name
      temp.sort((a, b) => {
        return a.name < b.name
          ? -1
          : 1;
      });

      // write to file
      fs.writeFile(file, JSON.stringify(temp, null, '\t'), 'utf8', (err) => {
        if (err) {
          console.error(err);
        }
        $('#modalAdd').modal('close');
        Materialize.toast(bookmark.name + ' added!', 4000);
      });
    });
  });
});

// read file content
function readF(callback) {
  checkFS();
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      callback(data);
    }
  });
}

// update bookmark collection each time the file changes
function updateCollection(data) {
  if (!data.length > 0) {
    return false;
  }

  let bookmarks = JSON.parse(data);

  let collection = $('#bookmarks');

  collection.empty();

  // collection entries
  bookmarks.forEach((bookmark, index) => {
    let listItem = $('<li class="collection-item" id=' + index + '></li>'),
      row = $('<div class="row" style="margin-bottom: 2px;"></div>'),

      col1 = $('<div class="col s8 left-align"></div>'),
      name = $('<h5 class="title"></h5>').text(bookmark.name),
      url = $('<p class="url"></p>').text(bookmark.url),

      col2 = $('<div class="col s4 right-align"></div>'),
      visit = $('<div class="row" style="margin-bottom: 0;"><a class="waves-effect waves-light btn visitURL">Visit</a></div>'),
      btnRow = $('<div class="row"></div>'),
      del = $('<a class="grey-text text-lighten-2 deleteItem" href="#"><i class="material-icons">delete_forever</i></a>');

    col1.append(name, url);
    btnRow.append(del);
    col2.append(btnRow, visit);
    row.append(col1, col2);
    listItem.append(row);
    collection.append(listItem);
  });

  $('a.visitURL').click(visitURL);
  $('a.deleteItem').click(deleteItem);
}

// validate form
function validateForm(name, url) {
  // check if name and url are specified
  if (!name && !url) {
    Materialize.toast('Please fill in the form!', 4000);
    $('#bookmark_name').addClass('invalid');
    $('#bookmark_url').addClass('invalid');
    return false;
  }
  if (!name) {
    Materialize.toast('Please specify a name!', 4000);
    $('#bookmark_name').addClass('invalid');
    return false;
  }
  if (!url) {
    Materialize.toast('Please specify a URL!', 4000);
    $('#bookmark_url').addClass('invalid');
    return false;
  }

  // check if name and url match regex
  let regexURL = /((https?:\/\/)|(www\.))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  let regexName = /.{1,16}/gi;

  if (!name.match(regexName) && !url.match(regexURL)) {
    Materialize.toast('Invalid Form!', 4000);
    $('#bookmark_name').addClass('invalid');
    $('#bookmark_url').addClass('invalid');
    return false;
  }
  if (!name.match(regexName)) {
    Materialize.toast('Please specify a valid name!', 4000);
    $('#bookmark_name').addClass('invalid');
    return false;
  }
  if (!url.match(regexURL)) {
    Materialize.toast('Please specify a valid URL!', 4000);
    $('#bookmark_url').addClass('invalid');
    return false;
  }

  return true;
}

function deleteItem(e) {
  let index = e.currentTarget.parentElement.parentElement.parentElement.parentElement.id;

  readF(data => {
    // delete clicked item from array
    let temp = JSON.parse(data),
      item = temp.splice(index, 1);

    // write to file
    fs.writeFile(file, JSON.stringify(temp, null, '\t'), 'utf8', (err) => {
      if (err) {
        console.error(err);
      }
      Materialize.toast(item[0].name + ' deleted!', 4000);
    });
  });
}

function visitURL(e) {
  let index = e.currentTarget.parentElement.parentElement.parentElement.parentElement.id;

  readF(data => {
    // delete clicked item from array
    let temp = JSON.parse(data);

    // open url in os-default browser
    shell.openExternal(temp[index].url);
  });
}

function checkFS() {
  // check if file exists, create if not
  if (!fs.existsSync(file)) {
    fs.open(file, 'w', (err, fd) => {
      fs.close(fd, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  }
}
