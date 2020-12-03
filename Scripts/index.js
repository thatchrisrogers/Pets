window.addEventListener("load", function (e) {
    initValidValues();

    if (window.location.href.split('?')[1] === undefined) { //If no query string parameters were passed...
        loadView('?view=home');
    } else {
        loadView(window.location.href);
    }
    //Init SPA behavior
    let navLinks = document.querySelectorAll('a.topNavLink, a.topNavLogo');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function (event) {
            event.preventDefault();
            loadView(this.href);
            document.querySelector('.topNav').classList.remove('responsive'); //Collapse the navbar after clicking a link.  This applies only to mobile / small screen view
        });
    }
});
function topNavToggle() {
    document.querySelector('.topNav').classList.toggle('responsive');
}
function loadView(href) {
    let view = findQueryStringValueByKey(href, 'view');
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/' + view + '.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('main').innerHTML = this.responseText;
            switch (view) {
                case 'home':
                    initHomeView();
                    break;
                case 'availability':
                    //initAvailabilityView();
                    break;   
                case 'customer':
                    initCustomerView();
                    break; 
                case 'careCalendar':
                    initCareCalendarView();
                    break;   
                case 'careRequest':  //ToDo - This is temporary while you build out the functionality
                    initCareRequestView(findQueryStringValueByKey(href, 'id'));
                    //initCareRequestView(6);
                    break;   
            }
            document.getElementById('Message').innerHTML = '';
            document.getElementById('Message').className = '';
            console.log(href + 'view was loaded')
        }
    }
    xhttp.send();
};
