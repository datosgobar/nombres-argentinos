jQuery(function ($) {

  /*
   * TODO: Check for Function.prototype.bind
  */

  var App = {
      /**
       *
       */
      initialize: function () {
        this.bindEvents();
      },
      /**
       *
       */
      bindEvents: function () {
        var $form = $("#name-form");

        $form.submit(function (event) {
          var name = $("#name").val()
            , year = $("#year").val()
            , processor;

          event.preventDefault();

          processor = new DataProcessor(name, year);
          processor.fetchData().done(function (data) {
            this.displayStatistics(data.statistics);
            this.processNameData(data.name, data.nameData);
            if (data.year) {
              $("#extra-year-data .specific-year").text(data.year);
              this.displayYearStatistics(data.yearData, "male");
              this.displayYearStatistics(data.yearData, "female");
            }
          }.bind(this)).fail(function (error) {
            alert(error.type);
          });
        }.bind(this));
      },
      /**
       *
       */
      displayStatistics: function (statistics) {
        var length = statistics.length
          , i = 0
          , $container = $("#extra-name-data ul")
          , $li, title, desc;

        $container.empty();

        for (; i < length; i += 1) {
          title = statistics[i].title;
          desc = statistics[i].description;
          $li = $("<li><span class=\"number-info\">" + title + "</span>" + desc + "</li>");
          $container.append($li);
        }
      },
      /**
       *
       */
      displayYearStatistics: function (yearData, gender) {
        var namesQuantity = []
          , genderIdentity = gender[0]
          , length = yearData[genderIdentity].length
          , i = 0;

        $("#" + gender + "-year-chart").empty();

        for (; i < length; i += 1) {
          namesQuantity.push([yearData[genderIdentity][i].name, yearData[genderIdentity][i].quantity]);
        }

        $.jqplot(gender + "-year-chart", [namesQuantity], {
          title: {
            show: false
          },
          seriesColors: ["#363B48", "#3199D5", "#EA4640", "#F0C340", "#9D58B0", "#52BE7F"],
          seriesDefaults: {
            renderer: $.jqplot.DonutRenderer,
            shadow: false,
            markerOptions: {
              shadow: false,
              show: false
            }
          },
          grid: {
            drawGridlines: true,
            drawBorder: false,
            borderWidth: 0,
            shadow: false,
            background: "#FFF"
          },
          highlighter: {
            show: true,
            sizeAdjust: 2.5,
            useAxesFormatters: false,
            tooltipSeparator: " &mdash; ",
            tooltipFormatString: "<span class=\"tooltip-item\">%s</span>"
          },
          legend: {
            show: true
          }
        });
      },
      /**
       *
       */
      processNameData: function (name, nameData) {
        var serie = []
          , length = nameData.length
          , i = 0
          , series = {};

        for (; i < length; i += 1) {
          serie.push([nameData[i].year, nameData[i].quantity]);
        }

        series[name] = serie;

        this.renderChart([name], series);
      },
      /**
       *
       */
      renderChart: function (names, series) {
        var quantitySeries = []
          , i = 0
          , namesSize = names.length
          , chart;

        for (i = 0; i < namesSize; i += 1) {
          quantitySeries.push(series[names[i]]);
        }

        $("#main").addClass("active");
        $("#main-chart").empty();

        $.jqplot("main-chart", quantitySeries, {
          title: {
            show: false
          },
          seriesColors: ["#363B48", "#3199D5", "#EA4640", "#F0C340", "#9D58B0"],
          seriesDefaults: {
            shadow: false,
            markerOptions: {
              shadow: false,
              show: false
            }
          },
          grid: {
            drawGridlines: true,
            drawBorder: false,
            borderWidth: 0,
            shadow: false,
            background: "#FFF",
            gridLineColor: "#E4E4E4"
          },
          axesDefaults: {
            showTickMarks: false,
            tickOptions: {
              showMark: false
            }
          },
          axes: {
            xaxis: {
              min: 1958,
              max: 2012,
              numberTicks: 10,
              tickOptions: {
                showGridline: false
              }
            },
            yaxis: {
              min: 0
            }
          },
          highlighter: {
            show: true,
            sizeAdjust: 2.5,
            useAxesFormatters: false,
            tooltipSeparator: " &mdash; ",
            tooltipFormatString: "<span class=\"tooltip-item\">%d</span>"
          },
          cursor: {
            show: false
          }
        });
      }
    };

  App.initialize();

});