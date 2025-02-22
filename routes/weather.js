var express = require('express');
var router = express.Router();

router.get('/:lat/:lon/:unit', function(req, res, next) {

  let lat = req.params.lat;
  let lon = req.params.lon;
  let unit = req.params.unit;

  getWeatherInfo(lat, lon, weatherSuccess, weatherError);

  function weatherSuccess({current_observation, forecasts}) {
    let response = { today: { wind: {} }, tomorrow: {}, dayafter: {} };
    populateToday(response.today, current_observation);
    populateTomorrow(response.tomorrow, forecasts[1]);
    populateDayAfter(response.dayafter, forecasts[2]);
    res.send(response);
  }  

  function weatherError(err) {
    console.log('\n -> ', err);
    res.render(
      'error',
      {
        message: 'Challange Charlie',
        error: {
          status: 666,
          stack: 'Not possible to load weather information.'
        }
      }
    );
  }

  function getWeatherInfo(latitude, longitude, success, error) {
    let OAuth = require('oauth');
    let request = new OAuth.OAuth(
      null,
      null,
      'dj0yJmk9djl1TlV0Ymx3dGVtJmQ9WVdrOWJXVm1NWE5STm5NbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTdi',
      '9134182aff0e14e9435615351c80b179b4a9ed1b',
      '1.0',
      null,
      'HMAC-SHA1',
      null,
      { 'X-Yahoo-App-Id': 'mef1sQ6s' }
    );
    request.get(
      `https://weather-ydn-yql.media.yahoo.com/forecastrss?lat=${latitude}&lon=${longitude}&u=${unit}&format=json`,
      null,
      null,
      function (err, data, result) {
        if (err) {
          error(err);
          return;
        }
        success(JSON.parse(data));
      }
    );
  }

  function degreesToCardinal(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  }

  function populateToday(today, current_observation) {
    if (Object.entries(current_observation).length > 0) {
      today.temperature = current_observation.condition.temperature;
      today.condition = getCondition(current_observation.condition.code);
      if (Object.entries(current_observation.atmosphere).length > 0) {
        today.humidity = current_observation.atmosphere.humidity;
        today.pressure =  current_observation.atmosphere.pressure;
      } else {
        today.humidity = '(n/a)';
        today.pressure =  '(n/a)';
      }
      if (Object.entries(current_observation.wind).length > 0) {
        today.wind.direction = degreesToCardinal(current_observation.wind.direction);
        today.wind.speed = current_observation.wind.speed;
      } else {
        today.wind.direction = '(n/a)';
        today.wind.speed =  '(n/a)';
      }
    } else {
      today.temperature = '(n/a)';
      today.condition = { icon: ')', description: '(n/a)' };
      today.humidity = '(n/a)';
      today.pressure =  '(n/a)';
      today.wind.direction = '(n/a)';
      today.wind.speed = '(n/a)';
    }
  }

  function populateTomorrow(tomorrow, forecast) {
    if (forecast != null) {
      tomorrow.temperature = forecast.high;
    } else {
      tomorrow.temperature = '(n/a)';
    }
  }

  function populateDayAfter(dayAfter, forecast) {
    if (forecast != null) {
      dayAfter.temperature = forecast.high;
    } else {
      dayAfter.temperature = '(n/a)';
    }
  }

  function getCondition(code) {
    switch (code) {
      case 0:
        return { icon: 'F', description: 'Tornado' };
      case 1:
        return { icon: 'T', description: 'Tempestade tropical' };
      case 2:
        return { icon: 'F', description: 'Furacão' };
      case 3:
        return { icon: 'Z', description: 'Tempestade de raios severa' };
      case 4:
        return { icon: 'O', description: 'Tempestade de raios' };
      case 5:
        return { icon: 'W', description: 'Neve e chuva' };
      case 6:
        return { icon: 'X', description: 'Granizo e chuva' };
      case 7:
        return { icon: 'W', description: 'Neve e granizo' };
      case 8:
        return { icon: 'R', description: 'Chuvisco congelante' };
      case 9:
        return { icon: 'Q', description: 'Chuvisco' };
      case 10:
        return { icon: 'R', description: 'Chuva congelante' };
      case 11:
        return { icon: 'T', description: 'Pancadas de chuva' };
      case 12:
        return { icon: 'X', description: 'Chuva' };
      case 13:
        return { icon: 'U', description: 'Flocos de neve' };
      case 14:
        return { icon: 'V', description: 'Pancadas de neve leve' };
      case 15:
        return { icon: 'U', description: 'Neve com vento' };
      case 16:
        return { icon: 'U', description: 'Neve' };
      case 17:
        return { icon: 'V', description: 'Geada' };
      case 18:
        return { icon: 'Q', description: 'Chuvisco' };
      case 19:
        return { icon: 'M', description: 'Empoeirado' };
      case 20:
        return { icon: 'M', description: 'Neblina' };
      case 21:
        return { icon: 'M', description: 'Serração' };
      case 22:
        return { icon: 'M', description: 'Esfumaçado' };
      case 23:
        return { icon: 'Z', description: 'Tesmpestuoso' };
      case 24:
        return { icon: 'F', description: 'Ventania' };
      case 25:
        return { icon: 'G', description: 'Frio' };
      case 26:
        return { icon: 'Y', description: 'Nublado' };
      case 27:
      case 28:
      case 29:
      case 30:
        return { icon: 'H', description: 'Parcialmente nublado' };
      case 31:
        return { icon: 'B', description: 'Céu limpo' };
      case 32:
        return { icon: 'B', description: 'Ensolarado' };
      case 33:
      case 34:
        return { icon: 'B', description: 'Bom tempo' };
      case 35:
        return { icon: 'X', description: 'Chuva com ganizo' };
      case 36:
        return { icon: 'B', description: 'Quente' };
      case 37:
        return { icon: 'P', description: 'Tempestades de raios isoladas' };
      case 38:
        return { icon: 'P', description: 'Tempestades de raios dispersas' };
      case 39:
        return { icon: 'T', description: 'Pancadas de chuva dispersas' };
      case 40:
        return { icon: 'W', description: 'Chuva pesada' };
      case 41:
        return { icon: 'V', description: 'Pancadas de neve dispersas' };
      case 42:
        return { icon: 'W', description: 'Neve pesada' };
      case 43:
        return { icon: 'W', description: 'Nevasca' };
      case 44:
        return { icon: '(na)', description: 'Indisponível' };
      case 45:
        return { icon: 'T', description: 'Pancadas de chuva dispersas' };
      case 46:
        return { icon: 'V', description: 'Pancadas de neve dispersas' };
      case 47:
        return { icon: 'P', description: 'Tempestades de raios dispersas' };
      default:
        return { icon: '(na)', description: 'Indisponível' };
    }
  } 

});

module.exports = router;
