"use strict";
// Init App
+function($, window){

	var app = {
		name: 'ABpoll',
		author: 'Dorcy',
		breakpoint : {
			mobile: 576,
		    tablet: 767,
		    laptop: 992,
		    desktop: 1440
		},
		colors : {

			//Contextual color
			primary : '#6569df',
			success : '#24d5d8',
			info : '#04a1f4',
			warning : '#fecd2f',
			danger : '#fd3259',

			//Opacity
			primaryOpacity: 'rgba(101, 105, 223, 0.1)',
			successOpacity: 'rgba(36, 213, 216, 0.1)',
			infoOpacity: 'rgba(4, 161, 244, 0.1)',
			warningOpacity: 'rgba(254, 205, 47, 0.1)',
			dangerOpacity: 'rgba(253, 50, 89, 0.1)',
			transparent: 'rgba(255, 255, 255, 0)',

			//Grayscale
			gray : '#fafafa',
			white : '#fff',
			dark : '#515365',
			textColor : '#8a8a8a',
			borderColor : '#e9e9e9',

			//Gradient Start color
			gradientPrimaryStart: '#b603c1',
			gradientSuccessStart: '#1dccdf',
			gradientInfoStart: '#6a4ee1',
			gradientWarningStart: '#f6d365',
			gradientDangerStart: '#f3301a',

			//Gradient Stop color
			gradientPrimaryStop: '#7a38e0',
			gradientSuccessStop: '#1de4bd',
			gradientInfoStop: '#05bdd7',
			gradientWarningStop: '#fda085',
			gradientDangerStop: '#f37138',

			//Contextual gradient color
			gradientPrimary : 'url(#gradient-primary)',
			gradientSuccess : 'url(#gradient-success)',
			gradientInfo : 'url(#gradient-info)',
			gradientWarning : 'url(#gradient-warning)',
			gradientDanger : 'url(#gradient-danger)'

		}
	};

	$(function () {
		var defs = d3.select('defs');
		var createGradientPrimary = defs.append('linearGradient')
			.attr('id', 'gradient-primary')
			.attr('x1', '0%')
			.attr('y1', '100%')
			.attr('x2', '100%')
			.attr('y2', '0%');
			createGradientPrimary.append('stop')
			.attr('offset', '0%')
			.attr('style', 'stop-color:' + app.colors.gradientPrimaryStart)
			.attr('stop-opacity', 1);
			createGradientPrimary.append('stop')
			.attr('offset', '100%')
			.attr('style', 'stop-color:' + app.colors.gradientPrimaryStop)
			.attr('stop-opacity', 1);
	});

	$(function () {
		var defs = d3.select('defs');
		var createGradientSuccess = defs.append('linearGradient')
			.attr('id', 'gradient-success')
			.attr('x1', '0%')
			.attr('y1', '100%')
			.attr('x2', '100%')
			.attr('y2', '0%');
			createGradientSuccess.append('stop')
			.attr('offset', '0%')
			.attr('style', 'stop-color:' + app.colors.gradientSuccessStart)
			.attr('stop-opacity', 1);
			createGradientSuccess.append('stop')
			.attr('offset', '100%')
			.attr('style', 'stop-color:' + app.colors.gradientSuccessStop)
			.attr('stop-opacity', 1);
	});

	$(function () {
		var defs = d3.select('defs');
		var createGradientInfo = defs.append('linearGradient')
			.attr('id', 'gradient-info')
			.attr('x1', '0%')
			.attr('y1', '100%')
			.attr('x2', '100%')
			.attr('y2', '0%');
			createGradientInfo.append('stop')
			.attr('offset', '0%')
			.attr('style', 'stop-color:' + app.colors.gradientInfoStart)
			.attr('stop-opacity', 1);
			createGradientInfo.append('stop')
			.attr('offset', '100%')
			.attr('style', 'stop-color:' + app.colors.gradientInfoStop)
			.attr('stop-opacity', 1);
	});

	$(function () {
		var defs = d3.select('defs');
		var createGradientWarning = defs.append('linearGradient')
			.attr('id', 'gradient-warning')
			.attr('x1', '0%')
			.attr('y1', '100%')
			.attr('x2', '100%')
			.attr('y2', '0%');
			createGradientWarning.append('stop')
			.attr('offset', '0%')
			.attr('style', 'stop-color:' + app.colors.gradientWarningStart)
			.attr('stop-opacity', 1);
			createGradientWarning.append('stop')
			.attr('offset', '100%')
			.attr('style', 'stop-color:' + app.colors.gradientWarningStop)
			.attr('stop-opacity', 1);
	});

	$(function () {
		var defs = d3.select('defs');
		var createGradientDanger = defs.append('linearGradient')
			.attr('id', 'gradient-danger')
			.attr('x1', '0%')
			.attr('y1', '100%')
			.attr('x2', '100%')
			.attr('y2', '0%');
			createGradientDanger.append('stop')
			.attr('offset', '0%')
			.attr('style', 'stop-color:' + app.colors.gradientDangerStart)
			.attr('stop-opacity', 1);
			createGradientDanger.append('stop')
			.attr('offset', '100%')
			.attr('style', 'stop-color:' + app.colors.gradientDangerStop)
			.attr('stop-opacity', 1);
	});

	window.app = app;

}(jQuery, window);

// Analytics Dashboard
+function($, window){

	var analyticalDashboard = {};

	analyticalDashboard.init = function() {

		//Segment Chart
		var segmentCtx = document.getElementById('segment-chart').getContext('2d');
		var segmentChart = new Chart(segmentCtx, {
			type: 'line',
			data: {
				labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				datasets: [{
					label: 'Series A',
					backgroundColor: app.colors.infoOpacity,
					borderColor: app.colors.info,
					data: [5200, 6600, 6100, 7600, 6800, 7400, 6600, 7300, 6800, 7200, 7000, 7800]
				}],
			},
			options: {
				legend: {
					display: false
				},
				maintainAspectRatio: false,
				elements: {
					line: {
						borderWidth: 1.5
					}
				},
				scales: {
					xAxes: [{display: false}],
					yAxes: [{gridLines: { color: app.colors.borderColor }}]
				}
			},
			scales: {
				yAxes: [{
					stacked: true,
					ticks: {
						min: 0,
						stepSize: 30,
					}
				}]
			}
		});

		//Bar Chart
		var statisticChart = document.getElementById("statistic-chart");
		var statisticCtx = statisticChart.getContext('2d');
		var statisticConfig = new Chart(statisticCtx, {
			type: 'bar',
			data: {
				labels: [ 'Model X', 'Model B', 'Model A', 'Model Y'],
				datasets: [{
					label: 'Series A',
					backgroundColor: [app.colors.success , app.colors.info, app.colors.primary, app.colors.warning],
					borderColor: app.colors.transparent,
					pointBackgroundColor: app.colors.primary,
					borderWidth: 4,
					data: [ 56, 48, 45, 50]
				}]
			},
			options: {
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						barPercentage: 0.6,
						gridLines: { color: app.colors.transparent }
					}],
					yAxes: [{display: false}]
				}
			}
		});
	};

	window.analyticalDashboard = analyticalDashboard;

}(jQuery, window);

// Cards
+function($, window){

	var cards = {};

	cards.init = function() {

		// Card Collapsible
        $('[data-toggle=card-collapse]').on('click', function(e){
			$(this).toggleClass('active').parents('.card').find('.card-collapsible').slideToggle();
	    });

		//card refresh
		$('[data-toggle=card-refresh]').on('click',function(e) {
			var cardRefreshSelector = $(this).parents('.card');
		    cardRefreshSelector.addClass('card-refresh');
		    window.setTimeout(function () {
		        cardRefreshSelector.removeClass('card-refresh');
		    }, 2000);
		    e.preventDefault();
		    e.stopPropagation();
		});

		//card removable
		$('[data-toggle=card-delete]').on('click',function(e) {
			var cardDeleteSelector = $(this).parents('.card');
		    cardDeleteSelector.addClass('animated zoomOut');
		    cardDeleteSelector.bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function () {
		        cardDeleteSelector.remove();
		    });
		    e.preventDefault();
		    e.stopPropagation();
		});
	};
	window.cards = cards;

}(jQuery, window);

// Tables
+function($, window){

	var tables = {};

	tables.init = function() {

		//Table Check All
		$('.checkAll').on('click', function () {
			$(this).closest('table').find('tbody :checkbox')
			.prop('checked', this.checked)
			.closest('tr').toggleClass('selected', this.checked);
		 });

		$('tbody :checkbox').on('click', function () {
			$(this).closest('tr').toggleClass('selected', this.checked);
			$(this).closest('table').find('.checkAll').prop('checked',
			($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length));
		});
	};
	window.tables = tables;

}(jQuery, window);

// initialize app
+function($) {
	cards.init();
	tables.init();
	analyticalDashboard.init();
}(jQuery);
