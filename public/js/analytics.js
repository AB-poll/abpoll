/* Author: Dorcy Shema
   E-mail: dorcy@skedo.tech
   Created: July 2021
   Version: 1.1.1
   Updated: May 2022
   File Description: This is where all the front end analytics/pixels/and tags will be hosted
*/

/************************************/
/*         INDEX                    */
/*==================================
 *     01.  Snapchat Pixel           *
 *     02.  Meta Pixel               *
 *     03.  Google                   *
 *     04.  OneSignal Notifications   *
 ====================================*/

//=========================================//
/*/*     1) Snapchat Pixel                 */
//=========================================//

//(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
//{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
//a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
//r.src=n;var u=t.getElementsByTagName(s)[0];
//u.parentNode.insertBefore(r,u);})(window,document,
//'https://sc-static.net/scevent.min.js');
//
//snaptr('init', 'fb065e7c-3896-4b1c-8da7-423c996c854a', {
//'user_email': '__INSERT_USER_EMAIL__'
//});
//
//snaptr('track', 'PAGE_VIEW');

//=========================================//
/*/*     2) Meta Pixel                    */
//=========================================//
//! function(f, b, e, v, n, t, s) {
//    if (f.fbq) return;
//    n = f.fbq = function() {
//        n.callMethod ?
//            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
//    };
//    if (!f._fbq) f._fbq = n;
//    n.push = n;
//    n.loaded = !0;
//    n.version = '2.0';
//    n.queue = [];
//    t = b.createElement(e);
//    t.async = !0;
//    t.src = v;
//    s = b.getElementsByTagName(e)[0];
//    s.parentNode.insertBefore(t, s)
//}(window, document, 'script',
//    'https://connect.facebook.net/en_US/fbevents.js');
//fbq('init', '2430087843689710');
//fbq('track', 'PageView');


//=========================================//
/*/*     3) Google Analytics              */
//=========================================//


window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', 'G-264FH0BM28');


//=========================================//
/*/*   4) OneSignal Notifications          */
//=========================================//

function subscribe_user_notification(){
    $.ajax({
        type: "POST",
        url: "/retrieve-channel-name",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data){
            let externalUserId = data;
            window.OneSignal = window.OneSignal || [];
              OneSignal.push(function() {
                OneSignal.setExternalUserId(externalUserId)
                OneSignal.init({
                  appId: "a58d1d2e-5f1b-42ec-8cd5-9505220db48f",
                  safari_web_id: "",
                  notifyButton: {
                    enable: false,
                  },
                });
              });
            return data;
        }
    });
}


//=========================================//
/*/*   5) Login With Google               */
//=========================================//
function decodeJwtResponse(credential) {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    $.ajax({
        type: "POST",
        url: "/login/google/pop_up",
        data: {
            "unique_id": responsePayload.sub,
            "users_email": responsePayload.email,
            "picture": responsePayload.picture,
            "users_name": responsePayload.given_name
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRFToken', $('meta[name=csrf-token]').attr('content'));
        },
        success: function(data) {
            window.location.reload();
        },
        error: function(data) {
            window.location.href = data.responseJSON;
        }
    });
}
