window.addEventListener("load", function (e) {
    if (window.location.href.split('?')[1] === undefined) { //If no query string parameters were passed...
        //loadView('?view=home');

        //Temp - assign person to keep from loggin in during dev
        person = { ID: 6, FirstName: 'Lucy', LastName: 'Rogers', UserName: 'LucyR' };
        initValidValues(displaySecurePages);
    } else {
        loadView(window.location.href);
    }
    //Init SPA behavior
    let navLinks = document.querySelectorAll('a.topNavLink');
    for (var i = 0; i < navLinks.length; i++) {
        if (navLinks[i].classList.contains('topNavIcon') === false) {
            navLinks[i].addEventListener('click', function (event) {
                event.preventDefault();
                loadView(this.href);
                document.querySelector('.topNav').classList.remove('responsive'); //Collapse the navbar after clicking a link.  This applies only to mobile / small screen view
            });
        }       
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
                case 'customer':
                    initCustomerView();
                    break; 
                case 'businessCalendar':
                    initbusinessCalendarView();
                    break;  
                case 'login':
                    initLoginView();
                    break;     
            }
            let message = document.getElementById('Message');
            if (message.classList.contains('messageError')) {
                message.innerHTML = '';
                message.className = '';
            }           
            console.log(href + 'view was loaded')
        }
    }
    xhttp.send();
};
