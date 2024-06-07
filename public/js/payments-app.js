import FormatTimes from './modules/formatTimes.js';
import CreateCoupon from './modules/createCoupon.js';
import CheckCoupon from './modules/checkCoupon.js';
import Payment from './modules/payment.js';

$(document).ready(function() {
  let csrfToken = $('meta[name=csrf-token]').attr('content');

  // TODO: If you want to enable Bootstrap JS components such as tooltips then
  // place those snippets of code here. Also don't forget to uncomment them
  // in both the modules/bootstrap.js file and in the SCSS at app.scss.
  // For example, to enable tooltips:
  //   $('[data-toggle="tooltip"]').tooltip();

  new FormatTimes('.js-from-now', '.js-short-date');
  new CreateCoupon('#duration_in_months_wrapper');
  new CheckCoupon('#coupon_code', csrfToken);
  new Payment('#subscription_form');
  new Payment('#payment_form');
});
