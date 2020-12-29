let user;
function initLoginView() {
    document.getElementById('LoginForm').onsubmit = function (event) {
        event.preventDefault();
        getUser(displaySecurePages);
    };
}
function getUser(callBackFunction) {
    let loginForm = document.getElementById('LoginForm');
    user = {};
    user.Name = loginForm.UserName.value;
    user.Password = loginForm.Password.value;

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/user", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                user = JSON.parse(this.responseText);  
                displaySuccess('Hi ' + user.FirstName + '.  Your Login was Successful');
                callBackFunction();
            }
            else {
                user = undefined;
                displayError('Login Error - User Name or Password was not found.', undefined);
            }
        }
    };
    xhttp.send(JSON.stringify(user));
    xhttp.onerror = function () {
        user = undefined;
        displayError('Login Error - onerror event');
    };
}
function displaySecurePages() {
    let secureNavLinks = document.querySelectorAll('a.topNavSecure');
    for (secureNavLink of secureNavLinks) {
        secureNavLink.style.display = 'block';
    }
    document.getElementById('LoginLink').style.display = 'none';
    setTimeout(function () {
        loadView('?view=home'); 
    }, 3000);    
}

    