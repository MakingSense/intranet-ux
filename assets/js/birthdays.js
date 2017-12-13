$(() => {
  const LSID = 'ms-staff';
  const VERSION = '0.0.1';
  let data = false;
  let tpl = $('#birthday-template').html();

  let options = {
    accessToken: CONTENTFUL_ACCESS_TOKEN,
    space: CONTENTFUL_SPACE_ID
  }
  let client = contentful.createClient(options);

  let q = {
    order: 'fields.birthday',
    include: 10,              // Resolve links depth (max: 10)
    content_type: 'staff'      // Contentful model type
  }

  let staff = getData();
  updateBirthdays(getNextBirthdays(staff), 3); // With Local Storage data
  refreshBirthdays(); // Get new data
  activateTimer(); // Refresh every 00 hour

  // Functions
  function getData() {
    if (data === false) {
      if (window.localStorage !== undefined) {
        let version = localStorage.getItem(LSID + '-v');
        if (version === VERSION) {
          try {
            data = JSON.parse(localStorage.getItem(LSID));
            return data;
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      } else {
        return [];
      }
    }
    return data;
  }

  function setData(items) {
    if (window.localStorage !== undefined) {
      localStorage.setItem(LSID + '-v', VERSION);
      localStorage.setItem(LSID, JSON.stringify(items));
    }
    data = items;
    return data;
  }

  function refreshBirthdays() {
    getStaff().then((staff) => {
      setData(staff);
      updateBirthdays(getNextBirthdays(staff), 3); // Get fresh data
    }, (e) => {
      // Oh, bugga...
      updateBirthdays(getData(), 3);
    });
  }

  function activateTimer() {
    // refresh after 00 hour
    var now = new Date();
    let until00 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    setTimeout(() => {
      refreshBirthdays();
      activateTimer();
    }, until00);
  }

  // Recursive calls for getting all staff members when all of them can't be fetched in one single call (max rows per fetch: 100).
  function getStaff(items) {
    return new Promise(function(resolve, reject) {
      if (items === undefined) items = [];
      client.getEntries(q).then(function (result) {
        items = items.concat(result.items);
        if (items.length < result.total) {
          return resolve(getStaff(items));
        } else {
          return resolve(items);
        }
      }, (e) => {
        reject(e);
      });
    });
  }

  function updateBirthdays(staff) {
    let $bdays = $('#birthdays-widget .abirthdays__list');
    if (staff.length) {
      let html = '';
      for (let i in staff) {
        let row = staff[i];
        let htmlrow = tpl;
        traverse(row, false, (path, val) => {
          htmlrow = tplReplace(htmlrow, path, val);
        });
        let pic = omap(row, 'fields.profilePic.fields.file.url');
        pic = (pic) ? pic + '?w=60' : '/img/no-avatar.jpg';
        htmlrow = tplReplace(htmlrow, 'birthday_pic', pic);
        htmlrow = tplReplace(htmlrow, 'birthday_number', row.fields.birthday);
        let mm, dd;
        [mm, dd] = row.fields.birthday.split('-');
        let d = new Date();
        d.setMonth(mm - 1, dd);
        htmlrow = tplReplace(htmlrow, 'birthday_text', d.getMonthName() + ' ' + d.getDayName());
        html += '<li>' + htmlrow + '</li>';
      }
      $bdays.html(html);
    } else {
      $bdays.html('<div class="no-birthdays">There are no birthdays loaded</div>');
    }
  }

  function getNextBirthdays(rows, n) {
    let staff = rows.slice();
    let now = new Date();
    for (i in staff) {
      let r = staff[0];
      let mm, dd;
      [mm, dd] = r.fields.birthday.split('-');
      let d = new Date();
      d.setMonth(mm - 1, dd);
      if (d > now) break;
      staff.push(staff.shift());
    }
    return staff.slice(0, 3);
  }
});