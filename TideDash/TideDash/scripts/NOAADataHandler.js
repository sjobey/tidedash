var NOAADataHandler = (function () {
    var noaaToken = "zahGGMnDWNrxNVgJrehLIVRaOhInVRQX";
    var noaaWeatherURL = "https://api.weather.gov/points/";
    var noaaTideURL = "https://tidesandcurrents.noaa.gov/api/datagetter?";

    var eNOAATideProduct = {
        water_level: "water_level",
        water_level_predictions: "predictions",
        water_level_hourly_height: "hourly_height",
        water_level_high_low: "high_low",
        water_level_daily_mean: "daily_mean",
        water_level_monthly_mean: "monthly_mean",
        water_level_one_minute_water_level: "one_minute_water_level",
        air_temperature: "air_temperature",
        water_temperature: "water_temperature",
        wind: "wind",
        air_pressure: "air_pressure",
        air_gap: "air_gap",
        conductivity: "conductivity",
        visibility: "visibility",
        humidity: "humidity",
        salinity: "salinity",
        datums: "datums",
        currents: "currents"
    }
    var eNOAATideDatum = {
        columbia_river_datum: "CRD",
        international_great_lakes_datum: "IGLD",
        great_lakes_low_water_datum_chart_datum: "LWD",
        mean_higher_high_water: "MHHW",
        mean_high_water: "MHW",
        mean_tide_level: "MTL",
        mean_sea_level: "MSL",
        mean_low_water: "MLW",
        mean_lower_low_water: "MLLW",
        north_american_vertical_datum: "NAVD",
        station_datum: "STND",
    }
    var GetNOAAData = function (station, fn) {
        var endpoint = station.lat + "," + station.lng;
        var urlforCoordinate = noaaWeatherURL + endpoint;
        $.ajax({
            url: urlforCoordinate,
            success: function (wCoord) {
                var range = GetTimeRange(-6, 6);
                requestCalls = GetTideDataRequests(station, range);
                requestCalls.push(RequestWeatherDataDef(wCoord));
                requestCalls.push(RequestAlertDataDef(wCoord));
                $.when.apply($, requestCalls).done(function (wp, wl, at, wt, w, al) {
                    var predictions = wp[0].predictions;
                    var levels = wl[0].data;
                    var waterTemp = wt[0].data;
                    var airTemp = at[0].data;
                    var alertsTemp = al[0].features;

                    if (airTemp == undefined) airTemp = at[0].error.message;
                    if (predictions == undefined) predictions = wp[0].error.message;
                    if (levels == undefined) levels = wl[0].error.message;
                    if (waterTemp == undefined) waterTemp = wt[0].error.message;
                    if (alertsTemp == undefined) alertsTemp = [];
                    ////highlows, manually calculate HL?
                    var dataCollected = {
                        waterLevelPrediction: predictions,
                        waterLevel: levels,
                        waterTemperature: waterTemp,
                        airTemperature: airTemp
                    }
                    //what if no weather data?
                    ParseWeatherData(dataCollected, w[0].properties.periods);
                    ParseAlertData(dataCollected, alertsTemp);
                    //
                    fn(dataCollected);
                });
            }
        });
    }
    var ParseAlertData = function(dataCollected, alerts){
        dataCollected.alerts = [];
        alerts.forEach(function (a) {
            var aItem = {
                certainty: a.properties.certainty,
                description: a.properties.description,
                headline: a.properties.headline,
                instruction: a.properties.instruction,
                severity: a.properties.severity,
                urgency: a.properties.urgency
            };
            dataCollected.alerts.push(aItem);
        });
    }
    var ParseWeatherData = function (dataCollected, wdata) {
        temps = [];
        windspeeds = [];
        winddirs = [];
        shorts = [];
        wdata.forEach(function (pd) {
            var dateStr = new Date(pd.startTime).toLocaleString().replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
            var time = new Date(dateStr);
            var timeIn = MatchNOAATimeFormat(time);
            temps.push({
                t: timeIn,
                v: pd.temperature
            });
            windspeeds.push({
                t: timeIn,
                v: pd.windSpeed
            });
            winddirs.push({
                t: timeIn,
                v: pd.windDirection
            });
            shorts.push({
                t: timeIn,
                v: pd.shortForecast
            });
        });
        dataCollected.airTemperatureForecast = temps;
        dataCollected.windSpeedForecast = windspeeds;
        dataCollected.windDirectionForecast = winddirs;
        dataCollected.shortForcast = shorts;
    }
    var RequestWeatherDataDef = function (wCoord) {
        //installed addin for "allow control allow origin" Hopefully this only needs for local host debug
        //must enable cache?
        var call = $.ajax({
            url: wCoord.properties.forecastHourly
        });
        return call;
    }
    var RequestAlertDataDef = function (wCoord) {
        var stationID = wCoord.properties.cwa;
        var urlBase = "https://api.weather.gov/alerts?active=1&point=";
        var call = $.ajax({
            url: urlBase + wCoord.geometry.coordinates[1] + "," + wCoord.geometry.coordinates[0]
        });
        return call;
    }
    var RequestTideDataDef = function (station, ran, product, datum) {
        var endpoints = "begin_date=" + ran[0] + "&end_date=" + ran[1] + "&station=" + station.id + "&product=" + product;
        if (datum != undefined) {
            endpoints += "&datum=" + datum;
        }
        endpoints += "&units=english&time_zone=lst_ldt&application=TIDEDASH&format=json";
        var urlforcall = noaaTideURL + endpoints;
        var call = $.ajax({
            url: urlforcall,
            cache: false,
            dataType: "json",
        });
        return call;
    }
    var GetTideDataRequests = function (station, range) {
        var wlevpre = RequestTideDataDef(station, range, eNOAATideProduct.water_level_predictions, eNOAATideDatum.mean_tide_level);
        var wlev = RequestTideDataDef(station, range, eNOAATideProduct.water_level, eNOAATideDatum.mean_tide_level);
        var atemp = RequestTideDataDef(station, range, eNOAATideProduct.air_temperature);
        var wtemp = RequestTideDataDef(station, range, eNOAATideProduct.water_temperature);
        return [wlevpre, wlev, atemp, wtemp];
    }
    var getMoonPhase = function (year, month, day) {
        var c = e = jd = b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09; //jd is total days elapsed
        jd /= 29.5305882; //divide by the moon cycle
        b = parseInt(jd); //int(jd) -> b, take integer part of jd
        jd -= b; //subtract integer part to leave fractional part of original jd
        b = Math.round(jd * 8); //scale fraction from 0-8 and round
        if (b >= 8) {
            b = 0; //0 and 8 are the same so turn 8 into 0
        }
        // 0 => New Moon
        // 1 => Waxing Crescent Moon
        // 2 => Quarter Moon
        // 3 => Waxing Gibbous Moon
        // 4 => Full Moon
        // 5 => Waning Gibbous Moon
        // 6 => Last Quarter Moon
        // 7 => Waning Crescent Moon
        return b;
    }
    var yyyymmdd = function (date) {
        var mm = date.getMonth()+1; // getMonth() is zero-based
        var dd = date.getDate();

        return [date.getFullYear(),
                (mm > 9 ? '' : '0') + mm,
                (dd > 9 ? '' : '0') + dd
        ].join('');
    };
    var GetTimeRange = function(ranEarlier, ranLater) {
        var early = new Date();
        early.setDate(early.getDate() + ranEarlier);

        var later = new Date();
        later.setDate(later.getDate() + ranLater);
        return [yyyymmdd(early), yyyymmdd(later)];
    }
    var MatchNOAATimeFormat = function (d) {
        var date = d.getDate();
        if (date.toString().length == 1) date = "0" + date;
        var month = d.getMonth() + 1; //Months are zero based
        if(month.toString().length == 1) month = "0" + month;
        var year = d.getFullYear();
        var hr = d.getHours();
        if (hr.toString().length == 1) hr = "0" + hr;
        var min = d.getMinutes();
        if (min.toString().length == 1) min = "0" + min;
        return year + "-" + month + "-" + date + " " + hr + ":" + min;
    }
    var GetNOAATimeFormatParser = function () {
        return "%Y-%m-%d %H:%M";
        //function Parser(d) {
        //    var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse;
        //    var entry = { date: parseDate(d.Time), val: parseFloat(d.VertPPV) }; // turn the date string into a date object
        //    return entry;
        //} 
    }
    var ajaxFailed = function (f) {
        console.log(f);
    }
    return {
        GetNOAAData:GetNOAAData,
        eNOAATideDatum: eNOAATideDatum,
        eNOAATideProduct:eNOAATideProduct
    }
});