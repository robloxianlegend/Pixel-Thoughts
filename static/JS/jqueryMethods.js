/* global document, $, html2canvas, window, navigator */

// Checks for mobile sites
window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const DEFAULT_MEDIATION = [
  'Take a deep breath in....',
  '....and breathe out',
  'Everything is okay',
  'Your life is okay',
  'Life is much grander than this thought',
  'The universe is over 93 billion light-years in distance',
  'Our galaxy is small',
  'Our sun is tiny',
  'The earth is minuscule',
  'Our cities are insignificant....',
  '....and you are microscopic',
  'This thought.... does not matter',
  'It can easily disappear',
  'and life will go on....',
];

const pathSegments = window.location.pathname
  .split('/')
  .map((p) => p.toLowerCase());

let messages = DEFAULT_MEDIATION;
let autofillText = '';
let isPreview = false;
let startedMeditation = false;
let meditationId;
let uuid;
const isCustom =
  pathSegments[1].toLowerCase() === 'meditations' ||
  pathSegments[1].toLowerCase() === 'preview';

const TIME_PER_MESSAGE = 4000;

// -------- COOKIES ---------
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function getOrSetUUID() {
  const cookieUUID = getCookie('uuid');
  if (cookieUUID) {
    return cookieUUID;
  }

  const newUUID = uuidv4();
  setCookie('uuid', newUUID, 10000);
  return newUUID;
}

// -------- Experimentation -------
const xp = ['b393328f'].sort();

// -------- Custom Mediation Functions -------

// Decode
function atou(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

function getQueryString(field, url) {
  const href = url || window.location.href;
  const reg = new RegExp(`[?&]${field}=([^&#]*)`, 'i');
  const string = reg.exec(href);
  return string ? string[1] : null;
}

// ----------------------------------

async function getMeditation() {
  let meditation;

  if (pathSegments[1] === 'meditations') {
    // eslint-disable-next-line prefer-destructuring
    meditationId = pathSegments[2];
    meditation = await window
      .fetch(`/api/meditation/${meditationId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        return response.json();
      });
  } else if (pathSegments[1] === 'preview') {
    isPreview = true;
    const customObj = getQueryString('m');
    if (customObj) {
      try {
        meditation = JSON.parse(atou(customObj));
      } catch (e) {
        throw new Error();
      }
    }
  }

  if (!meditation) {
    throw new Error();
  }

  if (meditation.text) {
    messages = meditation.text;
  }
  if (meditation.prompt) {
    $('.message__text').text(meditation.prompt);
  }

  if (meditation.autofillText) {
    autofillText = meditation.autofillText;
  }
}

// ----------- music ----------

const playMusic = () => {
  const audioPromise = document.querySelector('.audio').play();

  if (audioPromise !== undefined) {
    audioPromise.catch(() => {
      $('.submit').on('click', function () {
        document.querySelector('.audio').play();
      });
    });
  }
};

// ------------ main ------------
$(document).ready(function () {
  uuid = getOrSetUUID();
  playMusic();
  let messageId = null;
  let messageInterval = null;

  const loadLink = function () {
    if (window.location.hash) {
      const urlSplit = window.location.hash.split('m=');
      try {
        const customMessage = JSON.parse(window.atob(urlSplit[1]));
        const name = customMessage.pop();
        $('.custom-message-username').hide();
        $('.custom-message-username').text(`Meditation Created By: ${name}`);
        $('.custom-message-username').fadeIn(1000);
        messages = customMessage;
        console.log('loaded custom message');
      } catch (err) {
        console.log('Invalid message');
      }
    }
  };

  loadLink();
  // eslint-disable-next-line no-use-before-define
  disappearTitle();

  const showStar = function () {
    $('.done').animate({ opacity: '0' }, 1000);
    $('.overlay').animate({ opacity: '0' }, 1000);
    $('.main-star').animate({ opacity: '1' }, 3000);
    $('.input__thought').prop('disabled', false);
    $('.input__thought').animate({ opacity: '1' }, 3000);
    $('.submit').animate({ opacity: '1' }, 3000);
    $('.message').animate({ opacity: '0.5' }, 3000);
    if (autofillText) {
      $('.input__thought').prop('disabled', true);
      $('.submit').remove();
      setTimeout(function () {
        createText(autofillText);
      }, 4000);
    }
  };

  function createText(text) {
    setTimeout(function () {
      if (text.length) {
        const firstLetter = text[0];
        text = text.substring(1);
        $('.input__thought').val($('.input__thought').val() + firstLetter);
        createText(text);
        return;
      }

      initializeDisappear();
    }, Math.random() * 500);
  }

  if (isCustom) {
    getMeditation()
      .then(() => {
        setTimeout(showStar, 1000);
      })
      .catch((e) => {
        setTimeout(function () {
          $('.not-found').fadeIn(3000);
          $('main-title').hide();
        }, 1000);
      });
  } else {
    setTimeout(showStar, 7000);
  }

  function createOverlay() {
    $('.message').hide();
    $('.overlay').css({ display: 'flex' });
    $('.done').animate({ opacity: '1' }, 1000);
    setTimeout(() => {
      $('.done').animate({ opacity: '0' }, 1500);
    }, 3000);
    setTimeout(() => {
      $('.overlay').animate({ opacity: '1' }, 1500, function () {
        $('.done').hide();
      });
      $('.done2').animate({ opacity: '0.5' }, 1500);
      $('.show-delayed').animate({ opacity: '1' }, 1500);
    }, 4000);
    $('.message__text').text('Put a stressful thought in the star');
    $.ajax({
      type: 'PUT',
      url: '/message',
      data: {
        messageId,
        completedMeditation: true,
      },
    });
  }

  function resizeStar() {
    const lengthOfAnimation =
      messages === DEFAULT_MEDIATION
        ? 55000
        : TIME_PER_MESSAGE * messages.length;

    $('.main-star').css(
      'transition',
      `linear ${lengthOfAnimation / 1000}s transform`
    );
    $('.main-star').css({
      '-webkit-transform': `scale(${0.02})`,
      '-moz-transform': `scale(${0.02})`,
      '-ms-transform': `scale(${0.02})`,
      '-o-transform': `scale(${0.02})`,
      transform: `scale(${0.02})`,
    });
    $('.main-star').animate(
      { 'margin-top': '-250px' },
      lengthOfAnimation,
      'linear'
    );

    setTimeout(() => {
      $('.main-star').animate(
        { 'margin-top': '-1000px' },
        7000,
        'linear',
        function () {
          $('.main-star').remove();
          setTimeout(createOverlay, 1500);
          clearTimeout(messageInterval);
          $('.message').animate({ opacity: '0' }, 1000);
        }
      );
    }, lengthOfAnimation);
  }

  function disappearTitle() {
    setTimeout(
      () => {
        $('.main-title').animate({ opacity: '0' }, isCustom ? 1000 : 4000);
      },
      isCustom ? 1000 : 5000
    );
    setTimeout(() => {
      $('.main-title').remove();
    }, 9000);
  }

  function displayMessages() {
    let i = 0;
    messageInterval = setInterval(function () {
      if (i >= messages.length) {
        clearInterval(messageInterval);
        return;
      }
      const newText = messages[i++ % messages.length];
      $('.message__text').fadeOut(1000, function () {
        $('.message__text').text(newText).fadeIn(1000);
      });
    }, 4000);
  }

  function makeStarDisappear() {
    $('.message__text').fadeOut(1000, function () {
      $('.message__text').text('Relax and watch your thought').fadeIn(500);
    });
    setTimeout(() => {
      resizeStar();
      displayMessages();
    }, 3000);
  }

  function initializeDisappear() {
    $('.input__thought').prop('disabled', true);
    $('.btn-enterthought').prop('disabled', true);
    $('.main-star').css({ opacity: '1' });
    const allText = $('.input__thought').val();
    $('#subForm').append(
      `<input style="display: none" name="message" value=${allText
        .split(' ')
        .join('-')}>`
    );

    if (!isPreview && !startedMeditation) {
      const data = {
        message: `${allText}`,
        xp,
        uuid,
        meditationId,
      };
      window
        .fetch('https://freegeoip.app/json/')
        .then((response) => response.json())
        .then((geo) => {
          $.ajax({
            type: 'POST',
            url: '/message',
            data: {
              ...data,
              zip: geo.zip_code,
              country: geo.country_code,
            },
          }).done(function (msgId) {
            messageId = msgId;
          });
        })
        .catch(function (error) {
          $.ajax({
            type: 'POST',
            url: '/message',
            data: {
              ...data,
            },
          }).done(function (msgId) {
            messageId = msgId;
          });
        });
    }

    startedMeditation = true;

    $('.input__thought').val('');
    $('.main-star__thought-text').text(allText);
    $('.main-star__thought-text').css({ opacity: '0' });
    $('.main-star__thought-text').animate({ opacity: '1' }, 500);
    $('.main-star__thought-wrapper').textfill();
    const offsetHeight =
      ($('.main-star__thought-wrapper').height() -
        $('.main-star__thought-text').height()) /
      2;

    $('.main-star__thought-text').css({ top: `${offsetHeight}px` });

    $('.input__thought').animate({ opacity: '0' }, 500);
    $('.submit').animate({ opacity: '0' }, 500);
    setTimeout(makeStarDisappear, 4000);
  }

  // --------- Event Listeners -------

  if (window.mobileCheck()) {
    $('.input__thought').on('focus', () => {
      $('.main-star').stop();
      $('.main-star').css({ opacity: '0.05' });
    });

    $('.input__thought').on('blur', () => {
      $('.main-star').css({ opacity: '1' });
    });
  }

  $('.main-star__thought-wrapper').textfill();

  $('.input__thought').keyup(function (event) {
    if (event.keyCode === 13) {
      $('.submit').click();
    }
  });

  $('.submit').on('click', function () {
    if ($('.input__thought').val()) {
      initializeDisappear();
    }
  });

  $('.cta').on('click', function () {
    window.open('https://www.connectedbreath.co/start', '_blank');
    $.ajax({
      type: 'PUT',
      url: '/message',
      data: {
        messageId,
        ctaClicked: true,
      },
    });
  });
});
