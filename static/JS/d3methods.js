/* global, d3, Element, window */

const Background = function () {
  const obj = {
    stars: [],
    numberOfStars: 100,
    intervalID: null,
  };

  obj.initalize = function () {
    const isFirefox = typeof InstallTrigger !== 'undefined';

    if (isFirefox) {
      obj.numberOfStars = 50;
      obj.intervalID = setInterval(this.moveStars.bind(this), 40);
      obj.starInterval = setInterval(this.addStars.bind(this), 500);
    } else {
      obj.intervalID = setInterval(this.moveStars.bind(this), 25);
      obj.starInterval = setInterval(this.addStars.bind(this), 100);
    }
  };

  obj.stopStars = () => {
    clearInterval(obj.intervalID);
    clearInterval(obj.starInterval);
  };

  obj.getRandomWidth = function () {
    let width = Math.random() * window.innerWidth - 10;
    width = width < 0 ? 0 : width;
    return width;
  };

  obj.getRandomHeight = function () {
    let height = Math.random() * window.innerHeight - 10;
    height = height < 0 ? 0 : height;
    return height;
  };

  obj.setSpeed = function () {
    return Math.ceil((13 * Math.random()) / 4);
  };

  obj.addInitialStars = function () {
    for (let i = 0; i < this.numberOfStars; i++) {
      this.stars[i] = {
        width: this.getRandomWidth(),
        height: this.getRandomHeight(),
        speed: this.setSpeed(),
      };
    }

    d3.select('body')
      .selectAll('.stars')
      .data(
        function () {
          return this.stars;
        }.bind(this)
      )
      .enter()
      .insert('div')
      .attr('class', 'stars')
      .style('left', function (star) {
        return `${star.width}px`;
      })
      .style('top', function (star) {
        return `${star.height}px`;
      });
  };

  obj.moveStars = function () {
    d3.selectAll('.stars')
      .style('top', function (data) {
        data.height -= data.speed;
        return `${data.height}px`;
      })
      .style('width', function (data) {
        return `${data.speed}px`;
      })
      .style('height', function (data) {
        return `${data.speed}px`;
      })
      .attr('class', function (data) {
        if (data.height < 0) {
          return 'stars remove';
        }
        return 'stars';
      });

    // remove stars from DOM.
    d3.selectAll('.remove').remove();

    // remove stars from stars object.
    for (let i = 0; i < this.stars.length; i++) {
      if (this.stars[i].height < 0) {
        this.stars.splice(i, 1);
      }
    }
  };

  // add new stars to the screen
  obj.addStars = function () {
    const newStar = {
      width: this.getRandomWidth(),
      height: window.innerHeight + 100,
      speed: this.setSpeed(),
    };
    this.stars.push(newStar);

    d3.select('body')
      .selectAll('.stars')
      .data(this.stars)
      .enter()
      .append('div')
      .attr('class', 'stars')
      .style('left', function () {
        return `${newStar.width}px`;
      })
      .style('top', function () {
        return `${newStar.height}px`;
      });
  };

  return obj;
};

window.starsBackground = Background();
window.starsBackground.initalize();
