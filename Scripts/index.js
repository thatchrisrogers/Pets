window.addEventListener("load", function (e) {
    if (window.location.href.split('?')[1] === undefined) { //If no query string parameters were passed...
        loadView('?view=home');
    } else {
        loadView(window.location.href);
    }
    let navLinks = document.querySelectorAll('a.topNavItem, a.topNavLogo');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelector('.topNav').classList.remove('responsive'); //Collapse the navbar after clicking a link.  This applies only to mobile / small screen view
        });
    }
});
function topNavToggle() {
    document.querySelector('.topNav').classList.toggle('responsive');
}
function loadView(href) {
    let queryString = href.split('?')[1];
    let view = findQueryStringValueByKey(queryString, 'view');
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/' + view + '.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('main').innerHTML = this.responseText;
            switch (view) {
                case 'home':
                    //initHomeView();
                    break;
                case 'availability':
                    initAvailabilityView();
                    break;   
                case 'customer':
                    initCustomerView();
                    break;                 
            }
            document.getElementById('Message').innerHTML = '';
            document.getElementById('Message').className = '';
            console.log(href + 'view was loaded')
        }
    }
    xhttp.send();
};
function findQueryStringValueByKey(queryString, key) {
    let queryStringParams = [];
    let keyValues = queryString.split('&');
    for (let i = 0; i < keyValues.length; i++) {
        queryStringParams.push({ key: keyValues[i].split('=')[0], value: keyValues[i].split('=')[1] });
    }
    for (let i = 0; i < queryStringParams.length; i++) {
        if (queryStringParams[i]['key'] === key) {
            return queryStringParams[i]['value'];
        }
    }
    return null;
}